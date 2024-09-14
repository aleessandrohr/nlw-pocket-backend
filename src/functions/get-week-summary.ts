import { db } from "@/db";
import { goals, goalCompletions } from "@/db/schema";
import dayjs from "dayjs";
import { gte, lte, and, eq, sql, desc } from "drizzle-orm";

export const getWeekSummary = async () => {
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
			.where(lte(goals.createdAt, lastDayOfWeek)),
	);

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
				),
			),
	);

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
			.groupBy(goalsCompletedInWeek.completedAtDate),
	);

	interface Goal {
		id: string;
		title: string;
		completedAt: Date;
	}

	type GoalsPerDay = Record<string, Array<Goal>>;

	const result = await db
		.with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
		.select({
			completed:
				sql /*sql*/`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
					Number,
				),
			total:
				sql /*sql*/`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
					Number,
				),
			goalsPerDay: sql<GoalsPerDay>`
        JSON_OBJECT_AGG(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.completions}
        )
      `,
		})
		.from(goalsCompletedByWeekDay);

	const [summary] = result;

	return {
		summary,
	};
};
