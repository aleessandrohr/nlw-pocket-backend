import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { getWeekRange } from "@/functions/week/get-week-range";
import dayjs from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { and, asc, count, eq, gte, lte, sql } from "drizzle-orm";

interface GetWeekPendingGoalsRequest {
	userId: string;
	week?: string;
}

// Lista metas ativas e calcula as conclusões válidas da semana selecionada.
export const getWeekPendingGoals = async ({
	userId,
	week,
}: GetWeekPendingGoalsRequest) => {
	const { firstDayOfWeek, lastDayOfWeek } = getWeekRange({ week });
	const startOfToday = dayjs().startOf("day").toISOString();
	const endOfToday = dayjs().endOf("day").toISOString();

	const userGoals = db.$with("user_goals").as(
		db
			.select({
				id: goals.id,
				title: goals.title,
				desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
				createdAt: goals.createdAt,
			})
			.from(goals)
			.where(and(eq(goals.userId, userId), eq(goals.isArchived, false)))
	);

	logger.debug({ userGoals }, "user goals found");

	const goalCompletionCounts = db.$with("goal_completion_counts").as(
		db
			.select({
				goalId: goalCompletions.goalId,
				completionCount: count(goalCompletions.id).as("completion_count"),
				completedToday: sql<boolean>`BOOL_OR(
					${goalCompletions.createdAt} >= ${startOfToday}
					AND ${goalCompletions.createdAt} <= ${endOfToday}
				)`.as("completed_today"),
			})
			.from(goalCompletions)
			.where(
				and(
					gte(goalCompletions.createdAt, firstDayOfWeek),
					lte(goalCompletions.createdAt, lastDayOfWeek),
					eq(goalCompletions.isArchived, false)
				)
			)
			.groupBy(goalCompletions.goalId)
	);

	logger.debug({ goalCompletionCounts }, "goal completion counts");

	const pendingGoals = await db
		.with(userGoals, goalCompletionCounts)
		.select({
			id: userGoals.id,
			title: userGoals.title,
			desiredWeeklyFrequency: userGoals.desiredWeeklyFrequency,
			completionCount: sql`
				COALESCE(${goalCompletionCounts.completionCount}, 0)
			`.mapWith(Number),
			completedToday: sql<boolean>`
				COALESCE(${goalCompletionCounts.completedToday}, false)
			`.mapWith(Boolean),
		})
		.from(userGoals)
		.orderBy(asc(userGoals.createdAt))
		.leftJoin(
			goalCompletionCounts,
			eq(goalCompletionCounts.goalId, userGoals.id)
		);

	logger.debug({ pendingGoals }, "pending goals found");

	return {
		pendingGoals,
	};
};
