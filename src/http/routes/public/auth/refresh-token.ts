import {
	ACCESS_TOKEN_COOKIE_NAME,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	AUTH_RATE_LIMITS,
	CSRF_TOKEN_COOKIE_NAME,
	CSRF_TOKEN_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { refreshToken } from "@/functions/auth/refresh-token";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { logger } from "@/utils/logger";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const refreshTokenRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/refresh-token",
		{
			onRequest: [app.csrfProtection],
			config: { rateLimit: AUTH_RATE_LIMITS.refresh },
			schema: {
				summary: "Atualizar token",
				description: "Atualizar token",
				tags: ["auth", "public"],
			},
		},
		async (request, reply) => {
			try {
				const accessTokenFromCookie = request.cookies.accessToken;
				const refreshTokenFromCookie = request.cookies.refreshToken;

				if (!accessTokenFromCookie || !refreshTokenFromCookie)
					throw new AuthenticationError();

				const decodedAccessToken = app.jwt.decode(accessTokenFromCookie);

				if (
					!decodedAccessToken ||
					typeof decodedAccessToken !== "object" ||
					!("id" in decodedAccessToken) ||
					typeof decodedAccessToken.id !== "string"
				)
					throw new AuthenticationError();

				const userId = decodedAccessToken.id;

				logger.debug("decoded access token");

				const { accessTokenUpdated, refreshTokenUpdated } = await refreshToken({
					refreshTokenFromCookie,
					app,
					userId,
				});

				reply.setCookie(
					ACCESS_TOKEN_COOKIE_NAME,
					accessTokenUpdated,
					ACCESS_TOKEN_COOKIE_OPTIONS
				);
				reply.setCookie(
					REFRESH_TOKEN_COOKIE_NAME,
					refreshTokenUpdated,
					REFRESH_TOKEN_COOKIE_OPTIONS
				);

				return reply.status(200).send();
			} catch (error) {
				reply.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
					path: ACCESS_TOKEN_COOKIE_OPTIONS.path,
				});
				reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
					path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
				});
				reply.clearCookie(CSRF_TOKEN_COOKIE_NAME, {
					path: CSRF_TOKEN_COOKIE_OPTIONS.path,
				});

				throw error;
			}
		}
	);
};
