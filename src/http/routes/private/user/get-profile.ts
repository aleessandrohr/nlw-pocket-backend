import { getProfile } from "@/functions/user/get-profile";
import { getProfileResponseSchema } from "@/schemas/user/get-profile-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getProfileRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/user/profile",
		{
			onRequest: [app.authenticate],
			schema: {
				security: [{ bearerAuth: [] }],
				summary: "Pegar perfil do usuário",
				description: "Pegar perfil do usuário",
				tags: ["user", "private"],
				response: {
					200: getProfileResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.user;

			const { user } = await getProfile({ userId: id });

			return reply.status(200).send(user);
		}
	);
};
