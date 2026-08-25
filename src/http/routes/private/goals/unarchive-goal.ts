import { unarchiveGoal } from "@/functions/goals/unarchive-goal";
import { goalIdParamsSchema } from "@/schemas/goals/goal-id-params";
import { goalResponseSchema } from "@/schemas/goals/goal-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

// Registra a transição protegida de uma meta arquivada para ativa.
export const unarchiveGoalRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/goal/:goalId/unarchive",
		{
			onRequest: [app.authenticate, app.csrfProtection],
			schema: {
				params: goalIdParamsSchema,
				summary: "Desarquivar meta",
				description: "Desarquivar meta e suas conclusões",
				tags: ["goals", "private"],
				response: {
					200: goalResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { goalId } = request.params;
			const { goal } = await unarchiveGoal({
				goalId,
				userId: request.user.id,
			});

			return reply.status(200).send(goal);
		}
	);
};
