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

				// O access token pode estar expirado, mas sua assinatura ainda precisa ser válida.
				let verifiedAccessToken: Record<string, unknown>;

				try {
					verifiedAccessToken = app.jwt.verify<Record<string, unknown>>(
						accessTokenFromCookie,
						{ ignoreExpiration: true }
					);
				} catch {
					throw new AuthenticationError();
				}

				if (
					typeof verifiedAccessToken.id !== "string" ||
					typeof verifiedAccessToken.sessionId !== "string"
				)
					throw new AuthenticationError();

				const userId = verifiedAccessToken.id;
				const sessionId = verifiedAccessToken.sessionId;

				logger.debug("verified access token");

				const { accessTokenUpdated, refreshTokenUpdated } = await refreshToken({
					refreshTokenFromCookie,
					app,
					userId,
					sessionId,
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
				// Limpa credenciais somente quando elas são realmente inválidas.
				// Erros transitórios de banco ou infraestrutura preservam a sessão.
				if (error instanceof AuthenticationError) {
					reply.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
						path: ACCESS_TOKEN_COOKIE_OPTIONS.path,
					});
					reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
						path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
					});
					reply.clearCookie(CSRF_TOKEN_COOKIE_NAME, {
						path: CSRF_TOKEN_COOKIE_OPTIONS.path,
					});
				}

				throw error;
			}
		}
	);
};
