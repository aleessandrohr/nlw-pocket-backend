import { db } from "@/db";
import { goalCompletions, goals, sessions, users } from "@/db/schema";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import { verifyRefreshToken } from "@/utils/refresh-token";
import { and, eq, sql } from "drizzle-orm";

interface LogoutRequest {
	userId: string;
	sessionId: string;
	refreshTokenFromCookie: string;
}
export const logout = async ({
	userId,
	sessionId,
	refreshTokenFromCookie,
}: LogoutRequest) => {
	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, sessionId), eq(sessions.userId, userId)),
	});

	if (!session) throw new AuthenticationError();

	const isRefreshTokenValid = await verifyRefreshToken(
		refreshTokenFromCookie,
		session.hashedRefreshToken
	);

	if (!isRefreshTokenValid) throw new AuthenticationError();

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { isDemo: true },
	});

	if (!user) throw new AuthenticationError();

	await db.transaction(async tx => {
		await tx.delete(sessions).where(eq(sessions.id, session.id));

		if (!user.isDemo) return;

		// Remove os dados temporários da demo junto com a sessão confirmada.
		await tx.execute(sql`
			DELETE FROM "goal_completions"
			WHERE "goal_id" IN (
				SELECT "id" FROM "goals" WHERE "user_id" = ${userId}
			)
		`);
		await tx.delete(goals).where(eq(goals.userId, userId));
		await tx.delete(users).where(eq(users.id, userId));
	});

	return;
};
