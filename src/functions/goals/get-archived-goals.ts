import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { logger } from "@/utils/logger";
import { and, count, desc, eq } from "drizzle-orm";

interface GetArchivedGoalsRequest {
	userId: string;
}

// Lista somente as metas arquivadas do usuário com seu histórico de conclusões.
export const getArchivedGoals = async ({ userId }: GetArchivedGoalsRequest) => {
	const archivedGoals = await db
		.select({
			id: goals.id,
			title: goals.title,
			desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
			isArchived: goals.isArchived,
			archivedAt: goals.archivedAt,
			createdAt: goals.createdAt,
			completionCount: count(goalCompletions.id).mapWith(Number),
		})
		.from(goals)
		.leftJoin(
			goalCompletions,
			and(
				eq(goalCompletions.goalId, goals.id),
				eq(goalCompletions.isArchived, true)
			)
		)
		.where(and(eq(goals.userId, userId), eq(goals.isArchived, true)))
		.groupBy(
			goals.id,
			goals.title,
			goals.desiredWeeklyFrequency,
			goals.isArchived,
			goals.archivedAt,
			goals.createdAt
		)
		.orderBy(desc(goals.archivedAt), desc(goals.createdAt));

	logger.debug({ archivedGoals }, "archived goals found");

	return { archivedGoals };
};
