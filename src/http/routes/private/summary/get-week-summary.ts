import { getWeekSummary } from "@/functions/summary/get-week-summary";
import { getWeekSummaryResponseSchema } from "@/schemas/summary/get-week-summary-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/summary",
		{
			onRequest: [app.authenticate],
			schema: {
				summary: "Pegar resumo da semana",
				description: "Pegar resumo da semana",
				tags: ["summary", "private"],
				response: {
					200: getWeekSummaryResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userId = request.user.id;
			const { summary } = await getWeekSummary({ userId });

			return reply.status(200).send(summary);
		}
	);
};
