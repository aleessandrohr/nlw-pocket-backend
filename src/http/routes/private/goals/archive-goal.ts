import { archiveGoal } from "@/functions/goals/archive-goal";
import { goalIdParamsSchema } from "@/schemas/goals/goal-id-params";
import { goalResponseSchema } from "@/schemas/goals/goal-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

// Registra a transição protegida de uma meta ativa para arquivada.
export const archiveGoalRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/goal/:goalId/archive",
		{
			onRequest: [app.authenticate, app.csrfProtection],
			schema: {
				params: goalIdParamsSchema,
				summary: "Arquivar meta",
				description: "Arquivar meta e suas conclusões",
				tags: ["goals", "private"],
				response: {
					200: goalResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { goalId } = request.params;
			const { goal } = await archiveGoal({
				goalId,
				userId: request.user.id,
			});

			return reply.status(200).send(goal);
		}
	);
};
