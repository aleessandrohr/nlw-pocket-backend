import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastify from "fastify";
import { getPendingGoalsRoute } from "./routes/get-pending-goals";
import { createGoalRoute } from "./routes/create-goal";
import { createGoalCompletionRoute } from "./routes/create-goal-completion";
import { getWeekSummaryRoute } from "./routes/get-week-summary";
import { logger } from "@/utils/logger";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const routes = [
	createGoalRoute,
	getPendingGoalsRoute,
	createGoalCompletionRoute,
	getWeekSummaryRoute,
];

app.register(fastifyCors, {
	origin: "*",
});

for (const route of routes) {
	app.register(route);

	logger("warning", "route added", true, route.name);
}

const run = async () => {
	await app.listen({
		port: 3333,
	});

	logger("warning", "Server is running.");
};

run();
