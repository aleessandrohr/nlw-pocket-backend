import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { logger } from "@/utils/logger";
import { verifyPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import { eq } from "drizzle-orm";
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
		where: eq(users.email, email),
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

	if (!user) throw new AuthenticationError();

	const userWithoutPassword = {
		id: user.id,
		name: user.name,
		email: user.email,
		isDemo: user.isDemo,
		demoExpiresAt: user.demoExpiresAt,
		updatedAt: user.updatedAt,
		createdAt: user.createdAt,
	};

	logger.debug(
		{
			user: userWithoutPassword,
		},
		"user found"
	);

	const isPasswordCorrect = await verifyPassword(password, user.password);

	if (!isPasswordCorrect) throw new AuthenticationError();

	logger.debug(
		{
			user: userWithoutPassword,
		},
		"user authenticated"
	);

	const accessToken = app.jwt.sign(
		{
			id: user.id,
			name: user.name,
			email: user.email,
		},
		{
			expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
		}
	);

	logger.debug("access token jwt generated");

	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	await db.insert(sessions).values({
		userId: user.id,
		hashedRefreshToken,
		refreshTokenExpiresAt,
		userAgent,
		ipAddress,
	});

	logger.debug("hashed refresh token inserted");

	return {
		user: userWithoutPassword,
		accessToken,
		refreshToken,
		refreshTokenExpiresAt,
	};
};
