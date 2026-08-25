import { getArchivedGoals } from "@/functions/goals/get-archived-goals";
import { getArchivedGoalsResponseSchema } from "@/schemas/goals/get-archived-goals-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

// Expõe as metas arquivadas do usuário autenticado para a tela de restauração.
export const getArchivedGoalsRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/archived-goals",
		{
			onRequest: [app.authenticate],
			schema: {
				summary: "Pegar metas arquivadas",
				description: "Pegar metas arquivadas do usuário autenticado",
				tags: ["goals", "private"],
				response: {
					200: getArchivedGoalsResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { archivedGoals } = await getArchivedGoals({
				userId: request.user.id,
			});

			return reply.status(200).send(archivedGoals);
		}
	);
};
