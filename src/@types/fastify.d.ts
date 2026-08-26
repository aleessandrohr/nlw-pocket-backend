// src/@types/fastify-jwt.d.ts

import "@fastify/jwt";

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: {
			id: string;
			sessionId: string;
			name: string;
			email: string;
		};
		user: {
			id: string;
			sessionId: string;
			name: string;
			email: string;
		};
	}
}
