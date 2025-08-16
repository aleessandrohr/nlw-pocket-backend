import authPlugin from "@/plugins/auth";
import { env } from "@/schemas/env";
import { logger } from "@/utils/logger";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import {
	type ZodTypeProvider,
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { logoutRoute } from "./routes/private/auth/logout";
import { getProfileRoute } from "./routes/private/user/get-profile";
import { createUserRoute } from "./routes/public/auth/create-user";
import { loginRoute } from "./routes/public/auth/login";
import { refreshTokenRoute } from "./routes/public/auth/refresh-token";
import { createGoalRoute } from "./routes/public/goals/create-goal";
import { createGoalCompletionRoute } from "./routes/public/goals/create-goal-completion";
import { getPendingGoalsRoute } from "./routes/public/goals/get-pending-goals";
import { getWeekSummaryRoute } from "./routes/public/summary/get-week-summary";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler((error, _, reply) => {
	logger.error(error);

	if (error instanceof ZodError) {
		const errorDetails = error.issues.map(issue => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		return reply.status(400).send({
			statusCode: 400,
			error: "Bad Request",
			message: "invalid input data",
			details: errorDetails,
		});
	}

	if (error.validation) {
		return reply.status(400).send({
			statusCode: 400,
			error: "Bad Request",
			message: "invalid input data",
			details: error.validation,
		});
	}

	const statusCode = error.statusCode || 500;
	const message = error.statusCode ? error.message : "internal server error";

	if (process.env.NODE_ENV === "production" && statusCode === 500) {
		return reply.status(500).send({
			statusCode: 500,
			error: "Internal Server Error",
			message: "an unexpected error occurred on our server",
		});
	}

	reply.status(statusCode).send({
		statusCode,
		error: error.name || "Error",
		message,
		stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
	});
});
app.register(fastifyCors, {
	origin: "*",
});
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});
app.register(fastifySwagger, {
	mode: "dynamic",
	openapi: {
		info: {
			title: "in.orbit",
			description: "API para o projeto in.orbit",
			version: "0.1.0",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	transform: jsonSchemaTransform,
});
app.register(authPlugin);
app.register(fastifyCookie, {
	secret: env.COOKIE_SECRET,
});

const routes = [
	createUserRoute,
	createGoalRoute,
	getPendingGoalsRoute,
	createGoalCompletionRoute,
	getWeekSummaryRoute,
	loginRoute,
	getProfileRoute,
	refreshTokenRoute,
	logoutRoute,
];

for (const route of routes) {
	app.register(route);

	logger.info({ route: `${route.name}` }, "route added");
}

app.register(fastifySwaggerUi, {
	routePrefix: "/docs",
});

logger.info({ route: "/docs" }, "route added");

const run = async () => {
	await app.listen({
		port: env.PORT,
	});

	logger.info({ port: env.PORT }, "server is running!");
};

run();
