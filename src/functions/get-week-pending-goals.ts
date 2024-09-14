import { db } from "@/db";
import { goals, goalCompletions } from "@/db/schema";
import dayjs from "dayjs";
import { count, gte, lte, and, eq, sql, asc } from "drizzle-orm";

export const getWeekPendingGoals = async () => {
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
			.where(lte(goals.createdAt, lastDayOfWeek)),
	);

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
					lte(goalCompletions.createdAt, lastDayOfWeek),
				),
			)
			.groupBy(goalCompletions.goalId),
	);

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
			eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id),
		);

	return {
		pendingGoals,
	};
};
