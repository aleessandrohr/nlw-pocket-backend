import {
	ACCESS_TOKEN_COOKIE_NAME,
	CSRF_TOKEN_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE_NAME,
} from "@/config";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import authPlugin from "@/plugins/auth";
import { env } from "@/schemas/env";
import { logger } from "@/utils/logger";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyCsrfProtection from "@fastify/csrf-protection";
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
import { createGoalRoute } from "./routes/private/goals/create-goal";
import { createGoalCompletionRoute } from "./routes/private/goals/create-goal-completion";
import { getPendingGoalsRoute } from "./routes/private/goals/get-pending-goals";
import { getWeekSummaryRoute } from "./routes/private/summary/get-week-summary";
import { getProfileRoute } from "./routes/private/user/get-profile";
import { createUserRoute } from "./routes/public/auth/create-user";
import { csrfTokenRoute } from "./routes/public/auth/csrf-token";
import { loginRoute } from "./routes/public/auth/login";
import { refreshTokenRoute } from "./routes/public/auth/refresh-token";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler((error, request, reply) => {
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
	origin: env.FRONTEND_URL,
	credentials: true,
});
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: "accessToken",
		signed: false,
	},
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
app.register(fastifyCsrfProtection, {
	cookieOpts: CSRF_TOKEN_COOKIE_OPTIONS,
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
	csrfTokenRoute,
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
		host: env.HOST,
	});

	logger.info({ port: env.PORT, host: env.HOST }, "server is running!");
};

run();
