import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { logger } from "@/utils/logger";
import { hashPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import type { FastifyInstance } from "fastify";
import { PostgresError } from "postgres";
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

	try {
		const [newUser] = await db
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
				updatedAt: users.updatedAt,
				createdAt: users.createdAt,
			});

		logger.debug(
			{
				user: newUser,
			},
			"user created"
		);

		const accessToken = app.jwt.sign(
			{
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
			},
			{
				expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
			}
		);

		logger.debug("access token jwt generated");

		const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
			await generateRefreshToken();

		await db.insert(sessions).values({
			userId: newUser.id,
			hashedRefreshToken,
			refreshTokenExpiresAt,
			userAgent,
			ipAddress,
		});

		logger.debug("hashed refresh token inserted");

		return {
			user: newUser,
			accessToken,
			refreshToken,
		};
	} catch (error: unknown) {
		if (error instanceof PostgresError && error.code === "23505") {
			throw new ConflictError("user");
		}

		throw error;
	}
};
