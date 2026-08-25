import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import { getWeekRange } from "@/functions/week/get-week-range";
import { logger } from "@/utils/logger";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

interface GetWeekSummaryRequest {
	userId: string;
	week?: string;
}

// Monta o resumo da semana selecionada preservando o histórico das metas arquivadas.
export const getWeekSummary = async ({
	userId,
	week,
}: GetWeekSummaryRequest) => {
	const { firstDayOfWeek, lastDayOfWeek } = getWeekRange({ week });

	const [goalsTotal, goalsCompletedInWeek] = await Promise.all([
		db
			.select({
				total:
					sql<number>`COALESCE(SUM(${goals.desiredWeeklyFrequency}), 0)`.mapWith(
						Number
					),
			})
			.from(goals)
			.where(eq(goals.userId, userId)),
		db
			.select({
				id: goalCompletions.id,
				title: goals.title,
				isArchived: goals.isArchived,
				completedAt: goalCompletions.createdAt,
				completedAtDate: sql<string>`DATE(${goalCompletions.createdAt})`.as(
					"completedAtDate"
				),
			})
			.from(goalCompletions)
			.orderBy(desc(goalCompletions.createdAt))
			.innerJoin(goals, eq(goals.id, goalCompletions.goalId))
			.where(
				and(
					gte(goalCompletions.createdAt, firstDayOfWeek),
					lte(goalCompletions.createdAt, lastDayOfWeek),
					eq(goals.userId, userId)
				)
			),
	]);

	interface Goal {
		id: string;
		title: string;
		isArchived: boolean;
		completedAt: Date | string;
	}

	const goalsPerDay = goalsCompletedInWeek.reduce<Record<string, Array<Goal>>>(
		(accumulator, goal) => {
			const goalsForDay = accumulator[goal.completedAtDate] ?? [];
			goalsForDay.push({
				id: goal.id,
				title: goal.title,
				isArchived: goal.isArchived,
				completedAt: goal.completedAt,
			});
			accumulator[goal.completedAtDate] = goalsForDay;
			return accumulator;
		},
		{}
	);

	const summary = {
		completed: goalsCompletedInWeek.length,
		total: goalsTotal[0]?.total ?? 0,
		goalsPerDay: Object.keys(goalsPerDay).length > 0 ? goalsPerDay : null,
	};

	logger.debug({ summary }, "summary found");

	return {
		summary,
	};
};
