import { getWeekPendingGoals } from "@/functions/goals/get-week-pending-goals";
import { getPendingGoalsResponseSchema } from "@/schemas/goals/get-peding-goals-response";
import { weekQuerySchema } from "@/schemas/week";
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
				querystring: weekQuerySchema,
				response: {
					200: getPendingGoalsResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { week } = request.query;

			const { pendingGoals } = await getWeekPendingGoals({ userId, week });

			return reply.status(200).send(pendingGoals);
		}
	);
};
