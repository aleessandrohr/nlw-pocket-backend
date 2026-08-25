import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { getWeekRange } from "@/functions/week/get-week-range";
import { getCurrentAppDayRange } from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";

interface CreateGoalCompletionRequest {
	goalId: string;
	userId: string;
	week: number;
}

// Registra uma conclusão por dia, somente para uma meta ativa e pertencente ao usuário.
export const createGoalCompletion = async ({
	userId,
	goalId,
	week,
}: CreateGoalCompletionRequest) => {
	const selectedWeek = getWeekRange({ week });

	if (selectedWeek.week !== 0) {
		throw new ConflictError("goal", "can only be completed in current week");
	}

	const { firstDayOfWeek, lastDayOfWeek } = selectedWeek;

	return db.transaction(async tx => {
		// Bloqueia a meta durante a validação para impedir conclusões simultâneas no mesmo dia.
		const [goal] = await tx
			.select({ id: goals.id })
			.from(goals)
			.where(
				and(
					eq(goals.id, goalId),
					eq(goals.userId, userId),
					eq(goals.isArchived, false)
				)
			)
			.for("update")
			.limit(1);

		if (!goal) {
			throw new ConflictError("goal", "not found or does not belong to user");
		}

		const { start: startOfToday, end: endOfToday } = getCurrentAppDayRange();

		const [todayCompletion] = await tx
			.select({ id: goalCompletions.id })
			.from(goalCompletions)
			.where(
				and(
					eq(goalCompletions.goalId, goalId),
					eq(goalCompletions.isArchived, false),
					gte(goalCompletions.createdAt, startOfToday.toDate()),
					lte(goalCompletions.createdAt, endOfToday.toDate())
				)
			)
			.limit(1);

		if (todayCompletion) {
			throw new ConflictError("goal", "already completed today");
		}

		const goalCompletionCounts = tx.$with("goal_completion_counts").as(
			tx
				.select({
					goalId: goalCompletions.goalId,
					completionCount: count(goalCompletions.id).as("completion_count"),
				})
				.from(goalCompletions)
				.where(
					and(
						gte(goalCompletions.createdAt, firstDayOfWeek),
						lte(goalCompletions.createdAt, lastDayOfWeek),
						eq(goalCompletions.isArchived, false),
						eq(goalCompletions.goalId, goalId)
					)
				)
				.groupBy(goalCompletions.goalId)
		);

		const [result] = await tx
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

		if (!result) {
			throw new ConflictError("goal", "not found or does not belong to user");
		}

		const { completionCount, desiredWeeklyFrequency } = result;

		if (completionCount >= desiredWeeklyFrequency) {
			throw new ConflictError("goal", "already completed this week");
		}

		const [goalCompletion] = await tx
			.insert(goalCompletions)
			.values({ goalId })
			.returning();

		logger.debug({ goalCompletion }, "goal completion created");

		return {
			goalCompletion,
		};
	});
};
