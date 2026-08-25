import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { nowInAppTimeZone } from "@/lib/dayjs";
import { and, eq } from "drizzle-orm";
import { ConflictError } from "../errors/conflit-error";
import { NotFoundError } from "../errors/not-found-error";

interface ArchiveGoalRequest {
	goalId: string;
	userId: string;
}

// Arquiva a meta e as conclusões relacionadas em uma única transação.
export const archiveGoal = async ({ goalId, userId }: ArchiveGoalRequest) => {
	return db.transaction(async tx => {
		const [goal] = await tx
			.update(goals)
			.set({
				isArchived: true,
				archivedAt: nowInAppTimeZone().toDate(),
			})
			.where(
				and(
					eq(goals.id, goalId),
					eq(goals.userId, userId),
					eq(goals.isArchived, false)
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

			throw new ConflictError("goal", "is already archived");
		}

		await tx
			.update(goalCompletions)
			.set({ isArchived: true })
			.where(eq(goalCompletions.goalId, goalId));

		return { goal };
	});
};
