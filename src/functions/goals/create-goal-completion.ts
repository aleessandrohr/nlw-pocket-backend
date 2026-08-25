import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import dayjs from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";

interface CreateGoalCompletionRequest {
	goalId: string;
	userId: string;
}

export const createGoalCompletion = async ({
	userId,
	goalId,
}: CreateGoalCompletionRequest) => {
	const goalExists = await db
		.select({ id: goals.id })
		.from(goals)
		.where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
		.limit(1);

	if (goalExists.length === 0) {
		throw new ConflictError("goal", "not found or does not belong to user");
	}

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

	const [result] = await db
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

	const { completionCount, desiredWeeklyFrequency } = result;

	if (completionCount >= desiredWeeklyFrequency)
		throw new ConflictError("goal", "already completed this week");

	const insertResult = await db
		.insert(goalCompletions)
		.values({ goalId })
		.returning();

	const [goalCompletion] = insertResult;

	logger.debug({ goalCompletion }, "goal completion created");

	return {
		goalCompletion,
	};
};
