import { ACCESS_TOKEN_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { isDemoExpired } from "@/functions/demo/is-demo-expired";
import { nowInAppTimeZone } from "@/lib/dayjs";
import {
	generateRefreshToken,
	verifyRefreshToken,
} from "@/utils/refresh-token";
import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { AuthenticationError } from "../errors/authentication-error";

interface RefreshTokenRequest {
	refreshTokenFromCookie: string;
	app: FastifyInstance;
	userId: string;
	sessionId: string;
}

export const refreshToken = async ({
	refreshTokenFromCookie,
	app,
	userId,
	sessionId,
}: RefreshTokenRequest) => {
	const matchingSession = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, sessionId), eq(sessions.userId, userId)),
	});

	if (!matchingSession) throw new AuthenticationError();

	const isRefreshTokenValid = await verifyRefreshToken(
		refreshTokenFromCookie,
		matchingSession.hashedRefreshToken
	);

	if (!isRefreshTokenValid) throw new AuthenticationError();

	const now = nowInAppTimeZone();

	if (now.isAfter(matchingSession.refreshTokenExpiresAt)) {
		await db.delete(sessions).where(eq(sessions.id, matchingSession.id));

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

	const accessToken = app.jwt.sign(
		{
			id: user.id,
			sessionId: matchingSession.id,
			name: user.name,
			email: user.email,
		},
		{
			expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
		}
	);

	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	await db
		.update(sessions)
		.set({
			hashedRefreshToken,
			refreshTokenExpiresAt,
			updatedAt: now.toDate(),
		})
		.where(eq(sessions.id, matchingSession.id));

	return {
		accessTokenUpdated: accessToken,
		refreshTokenUpdated: refreshToken,
		user,
	};
};
