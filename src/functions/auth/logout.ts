import { db } from "@/db";
import { sessions } from "@/db/schema";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { logger } from "@/utils/logger";
import { verifyRefreshToken } from "@/utils/refresh-token";
import { eq } from "drizzle-orm";

interface LogoutRequest {
	userId: string;
	refreshTokenFromCookie: string;
}
export const logout = async ({
	userId,
	refreshTokenFromCookie,
}: LogoutRequest) => {
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

	await db.delete(sessions).where(eq(sessions.id, matchingSession.id));

	logger.debug(
		{
			userSession: userSessionWithoutHashedRefreshToken,
		},
		"user logged out"
	);

	return;
};
