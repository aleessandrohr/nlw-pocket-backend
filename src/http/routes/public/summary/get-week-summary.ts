import { getWeekSummary } from "@/functions/summary/get-week-summary";
import { getWeekSummaryResponseSchema } from "@/schemas/summary/get-week-summary-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/summary",
		{
			schema: {
				summary: "Pegar resumo da semana",
				description: "Pegar resumo da semana",
				tags: ["summary", "public"],
				response: {
					200: getWeekSummaryResponseSchema,
				},
			},
		},
		async (_, reply) => {
			const { summary } = await getWeekSummary();

			return reply.status(200).send(summary);
		}
	);
};
