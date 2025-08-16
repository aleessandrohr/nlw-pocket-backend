import { AuthenticationError } from "@/functions/errors/authentication-error";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

const authenticate = async (request: FastifyRequest) => {
	try {
		await request.jwtVerify();
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
