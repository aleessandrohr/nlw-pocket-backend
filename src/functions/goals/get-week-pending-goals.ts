import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { logger } from "@/utils/logger";
import dayjs from "dayjs";
import { and, asc, count, eq, gte, lte, sql } from "drizzle-orm";

interface GetWeekPendingGoalsRequest {
	userId: string;
}

export const getWeekPendingGoals = async ({
	userId,
}: GetWeekPendingGoalsRequest) => {
	const firstDayOfWeek = dayjs().startOf("week").toDate();
	const lastDayOfWeek = dayjs().endOf("week").toDate();

	const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
		db
			.select({
				id: goals.id,
				title: goals.title,
				desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
				createdAt: goals.createdAt,
			})
			.from(goals)
			.where(and(lte(goals.createdAt, lastDayOfWeek), eq(goals.userId, userId)))
	);

	logger.debug({ goalsCreatedUpToWeek }, "goals created up to week");

	const goalCompletionCounts = db.$with("goal_completion_counts").as(
		db
			.select({
				goalId: goalCompletions.goalId,
				completionCount: count(goalCompletions.id).as("completion_count"),
			})
			.from(goalCompletions)
			.where(
				and(
					gte(goalCompletions.createdAt, firstDayOfWeek),
					lte(goalCompletions.createdAt, lastDayOfWeek)
				)
			)
			.groupBy(goalCompletions.goalId)
	);

	logger.debug({ goalCompletionCounts }, "goal completion counts");

	const pendingGoals = await db
		.with(goalsCreatedUpToWeek, goalCompletionCounts)
		.select({
			id: goalsCreatedUpToWeek.id,
			title: goalsCreatedUpToWeek.title,
			desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
			completionCount: sql`
				COALESCE(${goalCompletionCounts.completionCount}, 0)
			`.mapWith(Number),
		})
		.from(goalsCreatedUpToWeek)
		.orderBy(asc(goalsCreatedUpToWeek.createdAt))
		.leftJoin(
			goalCompletionCounts,
			eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id)
		);

	logger.debug({ pendingGoals }, "pending goals found");

	return {
		pendingGoals,
	};
};
