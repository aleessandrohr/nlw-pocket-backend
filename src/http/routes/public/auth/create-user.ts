import {
	ACCESS_TOKEN_COOKIE_NAME,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	AUTH_RATE_LIMITS,
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { createUser } from "@/functions/auth/create-user";
import { createUserSchema } from "@/schemas/auth/create-user";
import { createUserResponseSchema } from "@/schemas/auth/create-user-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createUserRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/create-user",
		{
			onRequest: [app.csrfProtection],
			config: { rateLimit: AUTH_RATE_LIMITS.register },
			schema: {
				body: createUserSchema,
				summary: "Criar usuário",
				description: "Criar usuário",
				tags: ["auth", "user", "public"],
				response: {
					201: createUserResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;
			const userAgent = request.headers["user-agent"];
			const ipAddress = request.ip;

			const { accessToken, refreshToken, user } = await createUser({
				name,
				email,
				password,
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
