import { db } from "@/db";
import { users } from "@/db/schema";
import { isDemoExpired } from "@/functions/demo/is-demo-expired";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

const authenticate = async (request: FastifyRequest) => {
	try {
		await request.jwtVerify({
			onlyCookie: true,
		});

		// Revalida a expiração no banco para impedir que um JWT antigo mantenha a demo ativa.
		const user = await db.query.users.findFirst({
			where: eq(users.id, request.user.id),
			columns: {
				isDemo: true,
				demoExpiresAt: true,
			},
		});

		if (!user || isDemoExpired(user)) throw new AuthenticationError();
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
