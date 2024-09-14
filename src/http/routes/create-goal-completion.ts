import { createGoalCompletion } from "@/functions/create-goal-completion";
import { createGoalCompletionSchema } from "@/schemas/create-goal-completion";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/completion",
		{
			schema: {
				body: createGoalCompletionSchema,
			},
		},
		async request => {
			const { goalId } = request.body;

			await createGoalCompletion({
				goalId,
			});
		}
	);
};
