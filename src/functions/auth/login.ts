import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { isDemoExpired } from "@/functions/demo/is-demo-expired";
import { logger } from "@/utils/logger";
import { PASSWORD_TIMING_HASH, verifyPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { AuthenticationError } from "../errors/authentication-error";

interface LoginRequest {
	email: string;
	password: string;
	app: FastifyInstance;
	ipAddress: string;
	userAgent?: string;
}

export const login = async ({
	email,
	password,
	app,
	userAgent,
	ipAddress,
}: LoginRequest) => {
	// Carrega o estado demo para que o frontend consiga identificar a sessão atual.
	const user = await db.query.users.findFirst({
		// Mantém o login compatível com contas antigas gravadas com maiúsculas.
		where: sql`lower(${users.email}) = ${email}`,
		columns: {
			id: true,
			name: true,
			email: true,
			isDemo: true,
			demoExpiresAt: true,
			password: true,
			updatedAt: true,
			createdAt: true,
		},
	});

	const isPasswordCorrect = await verifyPassword(
		password,
		user?.password ?? PASSWORD_TIMING_HASH
	);

	if (!user || !isPasswordCorrect || isDemoExpired(user)) {
		throw new AuthenticationError();
	}

	const userWithoutPassword = {
		id: user.id,
		name: user.name,
		email: user.email,
		isDemo: user.isDemo,
		demoExpiresAt: user.demoExpiresAt,
		updatedAt: user.updatedAt,
		createdAt: user.createdAt,
	};

	logger.debug("user authenticated");

	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	const [session] = await db
		.insert(sessions)
		.values({
			userId: user.id,
			hashedRefreshToken,
			refreshTokenExpiresAt,
			userAgent,
			ipAddress,
		})
		.returning({ id: sessions.id });

	const accessToken = app.jwt.sign(
		{
			id: user.id,
			sessionId: session.id,
			name: user.name,
			email: user.email,
		},
		{
			expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
		}
	);

	logger.debug("session and access token created");

	return {
		user: userWithoutPassword,
		accessToken,
		refreshToken,
		refreshTokenExpiresAt,
	};
};
