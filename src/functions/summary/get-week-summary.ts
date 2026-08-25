import { db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import dayjs from "@/lib/dayjs";
import { logger } from "@/utils/logger";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

interface GetWeekSummaryRequest {
	userId: string;
}

export const getWeekSummary = async ({ userId }: GetWeekSummaryRequest) => {
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
			.where(and(lte(goals.createdAt, lastDayOfWeek), eq(goals.userId, userId)))
	);

	logger.debug({ goalsCreatedUpToWeek }, "goals created up to week");

	const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
		db
			.select({
				id: goalCompletions.id,
				title: goals.title,
				completedAt: goalCompletions.createdAt,
				completedAtDate: sql`
          DATE(${goalCompletions.createdAt})
        `.as("completedAtDate"),
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
			)
	);

	logger.debug({ goalsCompletedInWeek }, "goals completed in week");

	const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
		db
			.select({
				completedAtDate: goalsCompletedInWeek.completedAtDate,
				completions: sql`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'title', ${goalsCompletedInWeek.title},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )
        `.as("completions"),
			})
			.from(goalsCompletedInWeek)
			.groupBy(goalsCompletedInWeek.completedAtDate)
	);

	logger.debug({ goalsCompletedByWeekDay }, "goals completed by week day");

	interface Goal {
		id: string;
		title: string;
		completedAt: Date | string;
	}

	type GoalsPerDay = Record<string, Array<Goal>> | null;

	const [summary] = await db
		.with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
		.select({
			completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
				Number
			),
			total:
				sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
					Number
				),
			goalsPerDay: sql<GoalsPerDay>`
        JSON_OBJECT_AGG(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.completions}
        )
      `,
		})
		.from(goalsCompletedByWeekDay);

	logger.debug({ summary }, "summary found");

	return {
		summary,
	};
};
