import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { getWeekRange } from "@/functions/week/get-week-range";
import { logger } from "@/utils/logger";
import { and, eq } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";
import { NotFoundError } from "../errors/not-found-error";

interface DeleteGoalCompletionRequest {
	completionId: string;
	userId: string;
}

// Remove uma conclusão somente da semana atual e preserva o histórico do usuário.
export const deleteGoalCompletion = async ({
	completionId,
	userId,
}: DeleteGoalCompletionRequest) => {
	const { firstDayOfWeek, lastDayOfWeek } = getWeekRange({ week: 0 });

	return db.transaction(async tx => {
		const [completion] = await tx
			.select({
				id: goalCompletions.id,
				createdAt: goalCompletions.createdAt,
				isArchived: goalCompletions.isArchived,
				goalIsArchived: goals.isArchived,
			})
			.from(goalCompletions)
			.innerJoin(goals, eq(goals.id, goalCompletions.goalId))
			.where(
				and(eq(goalCompletions.id, completionId), eq(goals.userId, userId))
			)
			.for("update")
			.limit(1);

		if (!completion) throw new NotFoundError("goal completion");

		if (
			completion.isArchived ||
			completion.goalIsArchived ||
			completion.createdAt < firstDayOfWeek ||
			completion.createdAt > lastDayOfWeek
		) {
			throw new ConflictError("goal completion", "history cannot be changed");
		}

		const [deletedCompletion] = await tx
			.delete(goalCompletions)
			.where(eq(goalCompletions.id, completionId))
			.returning({ id: goalCompletions.id });

		if (!deletedCompletion) throw new NotFoundError("goal completion");

		logger.debug({ deletedCompletion }, "goal completion deleted");

		return {
			goalCompletion: deletedCompletion,
		};
	});
};
