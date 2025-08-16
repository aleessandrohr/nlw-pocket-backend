import { getWeekPendingGoals } from "@/functions/goals/get-week-pending-goals";
import { getPendingGoalsResponseSchema } from "@/schemas/goals/get-peding-goals-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/pending-goals",
		{
			schema: {
				summary: "Pegar metas",
				description: "Pegar metas",
				tags: ["goals", "public"],
				response: {
					200: getPendingGoalsResponseSchema,
				},
			},
		},
		async (_, reply) => {
			const { pendingGoals } = await getWeekPendingGoals();

			return reply.status(200).send(pendingGoals);
		}
	);
};
