import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { isDemoExpired } from "@/functions/demo/is-demo-expired";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { nowInAppTimeZone } from "@/lib/dayjs";
import { and, eq } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

const authenticate = async (request: FastifyRequest) => {
	try {
		await request.jwtVerify({
			onlyCookie: true,
		});

		const [session, user] = await Promise.all([
			// Exige que a sessão vinculada ao JWT continue ativa após logout ou revogação.
			db.query.sessions.findFirst({
				where: and(
					eq(sessions.id, request.user.sessionId),
					eq(sessions.userId, request.user.id)
				),
				columns: { refreshTokenExpiresAt: true },
			}),
			// Revalida a expiração no banco para impedir que um JWT antigo mantenha a demo ativa.
			db.query.users.findFirst({
				where: eq(users.id, request.user.id),
				columns: {
					isDemo: true,
					demoExpiresAt: true,
				},
			}),
		]);

		if (
			!session ||
			!nowInAppTimeZone().isBefore(session.refreshTokenExpiresAt) ||
			!user ||
			isDemoExpired(user)
		) {
			throw new AuthenticationError();
		}
	} catch (err) {
		throw new AuthenticationError();
	}
};

const authPlugin = async (app: FastifyInstance) => {
	app.decorate("authenticate", authenticate);
};

export default fp(authPlugin);

declare module "fastify" {
	interface FastifyInstance {
		authenticate: typeof authenticate;
	}
}
