import { deleteGoalCompletion } from "@/functions/goals/delete-goal-completion";
import { completionIdParamsSchema } from "@/schemas/goals/completion-id-params";
import { deleteGoalCompletionResponseSchema } from "@/schemas/goals/delete-goal-completion-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const deleteGoalCompletionRoute: FastifyPluginAsyncZod = async app => {
	app.delete(
		"/completion/:completionId",
		{
			onRequest: [app.authenticate, app.csrfProtection],
			schema: {
				params: completionIdParamsSchema,
				summary: "Desmarcar conclusão",
				description: "Remove somente a conclusão registrada no dia atual",
				tags: ["goals", "private"],
				response: {
					200: deleteGoalCompletionResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { completionId } = request.params;

			const { goalCompletion } = await deleteGoalCompletion({
				completionId,
				userId,
			});

			return reply.status(200).send(goalCompletion);
		}
	);
};
