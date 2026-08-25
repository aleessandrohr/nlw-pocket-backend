import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { getCurrentAppDayRange } from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { and, eq } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";
import { NotFoundError } from "../errors/not-found-error";

interface DeleteGoalCompletionRequest {
	completionId: string;
	userId: string;
}

// Remove somente a conclusão registrada hoje e mantém o histórico imutável.
export const deleteGoalCompletion = async ({
	completionId,
	userId,
}: DeleteGoalCompletionRequest) => {
	const { start: startOfToday, end: endOfToday } = getCurrentAppDayRange();

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
			completion.createdAt < startOfToday.toDate() ||
			completion.createdAt > endOfToday.toDate()
		) {
			throw new ConflictError(
				"goal completion",
				"only today's completion can be removed"
			);
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
