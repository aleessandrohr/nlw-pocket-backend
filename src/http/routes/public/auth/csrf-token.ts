import { crsfTokenResponseSchema } from "@/schemas/auth/crsf-token-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const csrfTokenRoute: FastifyPluginAsyncZod = async app => {
	app.get(
		"/auth/csrf-token",
		{
			schema: {
				summary: "Obter Csrf Token",
				description: "Obter Csrf Token",
				tags: ["auth", "private"],
				response: {
					200: crsfTokenResponseSchema,
				},
			},
		},
		async (_, reply) => {
			const csrfToken = reply.generateCsrf();

			return reply.status(200).send({ csrfToken });
		}
	);
};
