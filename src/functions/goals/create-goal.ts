import { db } from "@/db";
import { goals } from "@/db/schema";
import { logger } from "@/utils/logger";

interface CreateGoalRequest {
	title: string;
	desiredWeeklyFrequency: number;
}

export const createGoal = async ({
	title,
	desiredWeeklyFrequency,
}: CreateGoalRequest) => {
	const result = await db
		.insert(goals)
		.values({ title, desiredWeeklyFrequency })
		.returning();

	const [goal] = result;

	logger.debug({ goal }, "goal created");

	return {
		goal,
	};
};
