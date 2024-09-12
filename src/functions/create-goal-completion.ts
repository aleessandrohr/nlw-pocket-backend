import { db } from "@/db";
import { goals, goalCompletions } from "@/db/schema";
import { count, and, gte, lte, sql, eq } from "drizzle-orm";
import dayjs from "dayjs";
import { logger } from "@/utils/logger";

interface CreateGoalCompletionRequest {
	goalId: string;
}

export const createGoalCompletion = async ({
	goalId,
}: CreateGoalCompletionRequest) => {
	const firstDayOfWeek = dayjs().startOf("week").toDate();
	const lastDayOfWeek = dayjs().endOf("week").toDate();

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
					eq(goalCompletions.goalId, goalId)
				)
			)
			.groupBy(goalCompletions.goalId)
	);

	const result = await db
		.with(goalCompletionCounts)
		.select({
			desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
			completionCount: sql`
				COALESCE(${goalCompletionCounts.completionCount}, 0)
			`.mapWith(Number),
		})
		.from(goals)
		.leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
		.where(eq(goals.id, goalId));

	const { completionCount, desiredWeeklyFrequency } = result[0];

	if (completionCount >= desiredWeeklyFrequency) {
		logger("error", "goal already completed this week");
		throw new Error("goal already completed this week");
	}

	const insertResult = await db
		.insert(goalCompletions)
		.values({ goalId })
		.returning();

	const [goalCompletion] = insertResult;

	return {
		goalCompletion,
	};
};
