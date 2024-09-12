import { createGoalCompletion } from "@/functions/create-goal-completion";
import { createGoalCompletionSchema } from "@/schemas/create-goal-completion";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const completionsRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/completions",
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
