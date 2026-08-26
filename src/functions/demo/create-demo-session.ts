import { randomUUID } from "node:crypto";
import { ACCESS_TOKEN_EXPIRATION_TIME, DEMO_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { goalCompletions, goals, sessions, users } from "@/db/schema";
import { nowInAppTimeZone } from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { hashPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

interface CreateDemoSessionRequest {
	app: FastifyInstance;
	userAgent?: string;
	ipAddress: string;
}

// Cria uma conta demo isolada, com dados iniciais e sessão temporária para o visitante.
export const createDemoSession = async ({
	app,
	userAgent,
	ipAddress,
}: CreateDemoSessionRequest) => {
	const now = nowInAppTimeZone();
	const demoExpiresAt = now.add(DEMO_EXPIRATION_TIME, "second").toDate();
	const demoEmail = `demo-${createId()}@inorbit.local`;
	const hashedPassword = await hashPassword(randomUUID());
	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();
	const startOfCurrentWeek = now.startOf("week");
	const startOfPreviousWeek = startOfCurrentWeek.subtract(1, "week");
	const currentCompletionAt = now.subtract(30, "minute");

	const demoSession = await db.transaction(async tx => {
		// Limpa somente demos expiradas no mesmo commit da nova sessão.
		await tx.execute(sql`
			DELETE FROM "goal_completions"
			WHERE "goal_id" IN (
				SELECT goals."id"
				FROM "goals" AS goals
				INNER JOIN "users" AS users ON users."id" = goals."user_id"
				WHERE users."is_demo" = true
					AND (
						users."demo_expires_at" IS NULL
						OR users."demo_expires_at" <= NOW()
					)
			)
		`);
		await tx.execute(sql`
			DELETE FROM "goals"
			WHERE "user_id" IN (
				SELECT "id" FROM "users"
				WHERE "is_demo" = true
					AND (
						"demo_expires_at" IS NULL
						OR "demo_expires_at" <= NOW()
					)
			)
		`);
		await tx.execute(sql`
			DELETE FROM "users"
			WHERE "is_demo" = true
				AND (
					"demo_expires_at" IS NULL
					OR "demo_expires_at" <= NOW()
				)
		`);

		const [createdUser] = await tx
			.insert(users)
			.values({
				name: "Visitante Demo",
				email: demoEmail,
				password: hashedPassword,
				isDemo: true,
				demoExpiresAt,
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

		const createdGoals = await tx
			.insert(goals)
			.values([
				{
					userId: createdUser.id,
					title: "Acordar cedo",
					desiredWeeklyFrequency: 5,
					createdAt: now.subtract(14, "day").toDate(),
				},
				{
					userId: createdUser.id,
					title: "Me exercitar",
					desiredWeeklyFrequency: 3,
					createdAt: now.subtract(10, "day").toDate(),
				},
				{
					userId: createdUser.id,
					title: "Meditar",
					desiredWeeklyFrequency: 1,
					createdAt: now.subtract(7, "day").toDate(),
				},
				{
					userId: createdUser.id,
					title: "Planejar a semana",
					desiredWeeklyFrequency: 1,
					createdAt: now.subtract(1, "hour").toDate(),
				},
			])
			.returning({ id: goals.id });

		const archivedGoals = await tx
			.insert(goals)
			.values([
				{
					userId: createdUser.id,
					title: "Ler antes de dormir",
					desiredWeeklyFrequency: 4,
					isArchived: true,
					archivedAt: now.subtract(10, "minute").toDate(),
					createdAt: now.subtract(21, "day").toDate(),
				},
				{
					userId: createdUser.id,
					title: "Organizar finanças",
					desiredWeeklyFrequency: 2,
					isArchived: true,
					archivedAt: now.subtract(3, "day").toDate(),
					createdAt: now.subtract(30, "day").toDate(),
				},
			])
			.returning({ id: goals.id });

		const currentWeekDayCount = now.diff(startOfCurrentWeek, "day") + 1;
		const currentWeekDates = Array.from(
			{ length: currentWeekDayCount },
			(_, index) =>
				index === currentWeekDayCount - 1
					? currentCompletionAt
					: startOfCurrentWeek.add(index, "day").hour(10)
		);
		const exerciseCompletionIndexes = Array.from(
			new Set([0, currentWeekDayCount - 2, currentWeekDayCount - 1])
		).filter(index => index >= 0);

		// Preenche todos os dias já disponíveis e a semana anterior inteira, sem datas futuras.
		const demoCompletionValues = [
			...currentWeekDates.slice(0, 5).map(createdAt => ({
				goalId: createdGoals[0].id,
				createdAt: createdAt.toDate(),
			})),
			...exerciseCompletionIndexes.map(index => ({
				goalId: createdGoals[1].id,
				createdAt: currentWeekDates[index].toDate(),
			})),
			{
				goalId: createdGoals[2].id,
				createdAt: currentWeekDates.at(-1)?.toDate(),
			},
			{
				goalId: createdGoals[3].id,
				createdAt: currentWeekDates.at(-1)?.toDate(),
			},
			...Array.from({ length: 5 }, (_, index) => ({
				goalId: createdGoals[0].id,
				createdAt: startOfPreviousWeek.add(index, "day").hour(10).toDate(),
			})),
			...[0, 5, 6].map(index => ({
				goalId: createdGoals[1].id,
				createdAt: startOfPreviousWeek.add(index, "day").hour(11).toDate(),
			})),
			{
				goalId: createdGoals[2].id,
				createdAt: startOfPreviousWeek.add(6, "day").hour(12).toDate(),
			},
			{
				goalId: archivedGoals[0].id,
				isArchived: true,
				createdAt: currentCompletionAt.subtract(5, "minute").toDate(),
			},
			{
				goalId: archivedGoals[0].id,
				isArchived: true,
				createdAt: startOfPreviousWeek.add(1, "day").hour(13).toDate(),
			},
			{
				goalId: archivedGoals[1].id,
				isArchived: true,
				createdAt: startOfPreviousWeek.add(5, "day").hour(14).toDate(),
			},
		];

		await tx.insert(goalCompletions).values(demoCompletionValues);

		const [session] = await tx
			.insert(sessions)
			.values({
				userId: createdUser.id,
				hashedRefreshToken,
				refreshTokenExpiresAt,
				userAgent,
				ipAddress,
			})
			.returning({ id: sessions.id });

		return { user: createdUser, sessionId: session.id };
	});

	const accessToken = app.jwt.sign(
		{
			id: demoSession.user.id,
			sessionId: demoSession.sessionId,
			name: demoSession.user.name,
			email: demoSession.user.email,
		},
		{
			expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
		}
	);

	logger.debug("demo session created");

	return {
		user: demoSession.user,
		accessToken,
		refreshToken,
	};
};
