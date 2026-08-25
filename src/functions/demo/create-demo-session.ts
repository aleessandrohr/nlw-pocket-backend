import { randomUUID } from "node:crypto";
import { ACCESS_TOKEN_EXPIRATION_TIME, DEMO_EXPIRATION_TIME } from "@/config";
import { db } from "@/db";
import { goalCompletions, goals, sessions, users } from "@/db/schema";
import { deleteDemoData } from "@/functions/demo/delete-demo-data";
import dayjs from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { hashPassword } from "@/utils/password";
import { generateRefreshToken } from "@/utils/refresh-token";
import { createId } from "@paralleldrive/cuid2";
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
	await deleteDemoData();

	const demoExpiresAt = dayjs().add(DEMO_EXPIRATION_TIME, "second").toDate();
	const demoEmail = `demo-${createId()}@inorbit.local`;
	const hashedPassword = await hashPassword(randomUUID());
	const { hashedRefreshToken, refreshToken, refreshTokenExpiresAt } =
		await generateRefreshToken();

	const user = await db.transaction(async tx => {
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
				},
				{
					userId: createdUser.id,
					title: "Me exercitar",
					desiredWeeklyFrequency: 3,
				},
				{
					userId: createdUser.id,
					title: "Meditar",
					desiredWeeklyFrequency: 1,
				},
			])
			.returning({ id: goals.id });

		const startOfWeek = dayjs().startOf("week");

		await tx.insert(goalCompletions).values(
			createdGoals.map((goal, index) => ({
				goalId: goal.id,
				createdAt: startOfWeek.add(index, "day").toDate(),
			}))
		);

		await tx.insert(sessions).values({
			userId: createdUser.id,
			hashedRefreshToken,
			refreshTokenExpiresAt,
			userAgent,
			ipAddress,
		});

		return createdUser;
	});

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

	logger.debug(
		{
			userId: user.id,
			demoExpiresAt,
		},
		"demo session created"
	);

	return {
		user,
		accessToken,
		refreshToken,
	};
};
