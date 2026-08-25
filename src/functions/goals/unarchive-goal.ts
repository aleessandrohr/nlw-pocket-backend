import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";
import { NotFoundError } from "../errors/not-found-error";

interface UnarchiveGoalRequest {
	goalId: string;
	userId: string;
}

// Desarquiva a meta e reativa as conclusões relacionadas em uma transação.
export const unarchiveGoal = async ({
	goalId,
	userId,
}: UnarchiveGoalRequest) => {
	return db.transaction(async tx => {
		const [goal] = await tx
			.update(goals)
			.set({
				isArchived: false,
				archivedAt: null,
			})
			.where(
				and(
					eq(goals.id, goalId),
					eq(goals.userId, userId),
					eq(goals.isArchived, true)
				)
			)
			.returning();

		if (!goal) {
			const [existingGoal] = await tx
				.select({ isArchived: goals.isArchived })
				.from(goals)
				.where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
				.limit(1);

			if (!existingGoal) throw new NotFoundError("goal");

			throw new ConflictError("goal", "is not archived");
		}

		await tx
			.update(goalCompletions)
			.set({ isArchived: false })
			.where(eq(goalCompletions.goalId, goalId));

		return { goal };
	});
};
