import { createGoalCompletion } from "@/functions/goals/create-goal-completion";
import { createGoalCompletionSchema } from "@/schemas/goals/create-goal-completion";
import { createGoalCompletionResponseSchema } from "@/schemas/goals/create-goal-completion-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/completion",
		{
			schema: {
				body: createGoalCompletionSchema,
				summary: "Concluir meta",
				description: "Concluir meta",
				tags: ["goals", "public"],
				response: {
					201: createGoalCompletionResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { goalId } = request.body;

			const { goalCompletion } = await createGoalCompletion({
				goalId,
			});

			return reply.status(201).send(goalCompletion);
		}
	);
};
