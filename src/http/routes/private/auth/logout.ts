import {
	ACCESS_TOKEN_COOKIE_NAME,
	ACCESS_TOKEN_COOKIE_OPTIONS,
	CSRF_TOKEN_COOKIE_NAME,
	CSRF_TOKEN_COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from "@/config";
import { logout } from "@/functions/auth/logout";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const logoutRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/auth/logout",
		{
			onRequest: [app.authenticate, app.csrfProtection],
			schema: {
				summary: "Sair",
				description: "Sair",
				tags: ["auth", "private"],
			},
		},
		async (request, reply) => {
			const { id, sessionId } = request.user;
			const refreshTokenFromCookie = request.cookies.refreshToken;

			if (!refreshTokenFromCookie) throw new AuthenticationError();

			await logout({
				userId: id,
				sessionId,
				refreshTokenFromCookie,
			});

			reply.clearCookie(CSRF_TOKEN_COOKIE_NAME, {
				path: CSRF_TOKEN_COOKIE_OPTIONS.path,
			});
			reply.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
				path: ACCESS_TOKEN_COOKIE_OPTIONS.path,
			});
			reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
				path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
			});

			return reply.status(204).send();
		}
	);
};
