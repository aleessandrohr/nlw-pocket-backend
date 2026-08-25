import { createGoalCompletion } from "@/functions/goals/create-goal-completion";
import { createGoalCompletionSchema } from "@/schemas/goals/create-goal-completion";
import { createGoalCompletionResponseSchema } from "@/schemas/goals/create-goal-completion-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/completion",
		{
			onRequest: [app.authenticate, app.csrfProtection],
			schema: {
				body: createGoalCompletionSchema,
				summary: "Concluir meta",
				description: "Concluir meta",
				tags: ["goals", "private"],
				response: {
					201: createGoalCompletionResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { goalId, week } = request.body;

			const { goalCompletion } = await createGoalCompletion({
				userId,
				goalId,
				week,
			});

			return reply.status(201).send(goalCompletion);
		}
	);
};
