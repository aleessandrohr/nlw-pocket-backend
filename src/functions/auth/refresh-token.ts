import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { isDemoExpired } from "@/functions/demo/is-demo-expired";
import dayjs from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import {
	generateRefreshToken,
	verifyRefreshToken,
} from "@/utils/refresh-token";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { AuthenticationError } from "../errors/authentication-error";

interface RefreshTokenRequest {
	refreshTokenFromCookie: string;
	app: FastifyInstance;
	userId: string;
}

export const refreshToken = async ({
	refreshTokenFromCookie,
	app,
	userId,
}: RefreshTokenRequest) => {
	const userSessions = await db.query.sessions.findMany({
		where: eq(sessions.userId, userId),
	});

	if (userSessions.length === 0) throw new AuthenticationError();

	logger.debug(
		{
			userSessions: userSessions.map(session => ({
				id: session.id,
				userId: session.userId,
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
			})),
		},
		"user sessions found"
	);

	let matchingSession: typeof sessions.$inferSelect | null = null;

	for (const session of userSessions) {
		const isMatch = await verifyRefreshToken(
			refreshTokenFromCookie,
			session.hashedRefreshToken
		);

		if (isMatch) {
			matchingSession = session;

			break;
		}
	}

	if (!matchingSession) throw new AuthenticationError();

	const userSessionWithoutHashedRefreshToken = {
		id: matchingSession.id,
		userId: matchingSession.userId,
		userAgent: matchingSession.userAgent,
		ipAddress: matchingSession.ipAddress,
	};

	logger.debug(
		{
			userSession: userSessionWithoutHashedRefreshToken,
		},
		"user session found"
	);

	const now = dayjs();

	if (now.isAfter(matchingSession.refreshTokenExpiresAt)) {
		await db.delete(sessions).where(eq(sessions.id, matchingSession.id));

		logger.debug(
			{
				userSession: userSessionWithoutHashedRefreshToken,
			},
			"user session expired"
		);

		throw new AuthenticationError();
	}

	// Preserva o estado demo ao renovar os tokens da sessão autenticada.
	const user = await db.query.users.findFirst({
		where: eq(users.id, matchingSession.userId),
		columns: {
			id: true,
			name: true,
			email: true,
			isDemo: true,
			demoExpiresAt: true,
			updatedAt: true,
			createdAt: true,
		},
	});

	if (!user) throw new AuthenticationError();

	if (isDemoExpired(user)) {
		await db.delete(sessions).where(eq(sessions.id, matchingSession.id));

		throw new AuthenticationError();
	}

	logger.debug(
		{
			user,
		},
		"user found"
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

	logger.debug("access token jwt refreshed");

	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	await db
		.update(sessions)
		.set({
			hashedRefreshToken,
			refreshTokenExpiresAt,
			updatedAt: new Date(),
		})
		.where(eq(sessions.id, matchingSession.id));

	logger.debug("hashed refresh token updated");

	return {
		accessTokenUpdated: accessToken,
		refreshTokenUpdated: refreshToken,
		user,
	};
};
