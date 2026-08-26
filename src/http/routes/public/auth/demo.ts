import {
	ACCESS_TOKEN_COOKIE_NAME,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	AUTH_RATE_LIMITS,
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { createDemoSession } from "@/functions/demo/create-demo-session";
import { createUserResponseSchema } from "@/schemas/auth/create-user-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const demoRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/demo",
		{
			onRequest: [app.csrfProtection],
			config: { rateLimit: AUTH_RATE_LIMITS.demo },
			schema: {
				summary: "Iniciar demonstração",
				description:
					"Cria uma conta temporária e inicia uma sessão de demonstração.",
				tags: ["auth", "demo", "public"],
				response: {
					201: createUserResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const userAgent = request.headers["user-agent"];
			const ipAddress = request.ip;

			const { accessToken, refreshToken, user } = await createDemoSession({
				app,
				userAgent,
				ipAddress,
			});

			reply.setCookie(
				ACCESS_TOKEN_COOKIE_NAME,
				accessToken,
				ACCESS_TOKEN_COOKIE_OPTIONS
			);
			reply.setCookie(
				REFRESH_TOKEN_COOKIE_NAME,
				refreshToken,
				REFRESH_TOKEN_COOKIE_OPTIONS
			);

			return reply.status(201).send(user);
		}
	);
};
