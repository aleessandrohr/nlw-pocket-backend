import {
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { refreshToken } from "@/functions/auth/refresh-token";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { refreshTokenSchema } from "@/schemas/auth/refresh-token";
import { refreshTokenResponseSchema } from "@/schemas/auth/refresh-token-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const refreshTokenRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/refresh-token",
		{
			schema: {
				body: refreshTokenSchema,
				summary: "Atualizar token",
				description: "Atualizar token",
				tags: ["auth", "public"],
				response: {
					200: refreshTokenResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { userId } = request.body;
			const refreshTokenFromCookie = request.cookies.refreshToken;

			if (!refreshTokenFromCookie) throw new AuthenticationError();

			const { accessTokenUpdated, refreshTokenUpdated } = await refreshToken({
				refreshTokenFromCookie,
				app,
				userId,
			});

			reply.setCookie(
				REFRESH_TOKEN_COOKIE_NAME,
				refreshTokenUpdated,
				REFRESH_TOKEN_COOKIE_OPTIONS
			);

			return reply.status(200).send({ accessToken: accessTokenUpdated });
		}
	);
};
