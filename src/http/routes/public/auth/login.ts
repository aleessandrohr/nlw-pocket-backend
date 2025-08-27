import {
	ACCESS_TOKEN_COOKIE_NAME,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { login } from "@/functions/auth/login";
import { loginSchema } from "@/schemas/auth/login";
import { loginResponseSchema } from "@/schemas/auth/login-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const loginRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/login",
		{
			schema: {
				body: loginSchema,
				summary: "Entrar",
				description: "Entrar",
				tags: ["auth", "public"],
				response: {
					200: loginResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;
			const userAgent = request.headers["user-agent"];
			const ipAddress = request.ip;

			const { accessToken, refreshToken, user } = await login({
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

			return reply.status(200).send(user);
		}
	);
};
