import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { logger } from "@/utils/logger";
import { hashPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import type { FastifyInstance } from "fastify";
import postgres from "postgres";
import { ConflictError } from "../errors/conflit-error";

interface CreateUserRequest {
	name: string;
	email: string;
	password: string;
	app: FastifyInstance;
	userAgent?: string;
	ipAddress: string;
}

export const createUser = async ({
	name,
	email,
	password,
	app,
	userAgent,
	ipAddress,
}: CreateUserRequest) => {
	const hashedPassword = await hashPassword(password);
	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	try {
		const { newUser, sessionId } = await db.transaction(async tx => {
			// Cria usuário e sessão no mesmo commit para não deixar contas incompletas.
			const [newUser] = await tx
				.insert(users)
				.values({
					name,
					email,
					password: hashedPassword,
				})
				.returning({
					id: users.id,
					name: users.name,
					email: users.email,
					isDemo: users.isDemo,
					demoExpiresAt: users.demoExpiresAt,
					updatedAt: users.updatedAt,
					createdAt: users.createdAt,
				});

			const [session] = await tx
				.insert(sessions)
				.values({
					userId: newUser.id,
					hashedRefreshToken,
					refreshTokenExpiresAt,
					userAgent,
					ipAddress,
				})
				.returning({ id: sessions.id });

			return { newUser, sessionId: session.id };
		});

		logger.debug("user created");

		const accessToken = app.jwt.sign(
			{
				id: newUser.id,
				sessionId,
				name: newUser.name,
				email: newUser.email,
			},
			{
				expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
			}
		);

		logger.debug("access token jwt generated");

		logger.debug("user and session created");

		return {
			user: newUser,
			accessToken,
			refreshToken,
		};
	} catch (error: unknown) {
		if (error instanceof postgres.PostgresError && error.code === "23505") {
			throw new ConflictError("user");
		}

		throw error;
	}
};
