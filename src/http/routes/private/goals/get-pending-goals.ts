import { getWeekPendingGoals } from "@/functions/goals/get-week-pending-goals";
import { getPendingGoalsResponseSchema } from "@/schemas/goals/get-peding-goals-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/pending-goals",
		{
			onRequest: [app.authenticate],
			schema: {
				summary: "Pegar metas",
				description: "Pegar metas",
				tags: ["goals", "private"],
				response: {
					200: getPendingGoalsResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;

			const { pendingGoals } = await getWeekPendingGoals({ userId });

			return reply.status(200).send(pendingGoals);
		}
	);
};
