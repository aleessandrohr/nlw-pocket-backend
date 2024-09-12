import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastify from "fastify";
import { getPendingGoalsRoute } from "./routes/pending-goals";
import { getGoalsRoute } from "./routes/goals";
import { completionsRoute } from "./routes/completions";
import { logger } from "@/utils/logger";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const routes = [getGoalsRoute, getPendingGoalsRoute, completionsRoute];

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
