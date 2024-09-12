import { db } from "@/db";
import { goals } from "@/db/schema";

interface CreateGoalRequest {
	title: string;
	desiredWeeklyFrequency: number;
}

export const createGoal = async ({title, desiredWeeklyFrequency}: CreateGoalRequest) => {
	const result = await db.insert(goals).values({ title, desiredWeeklyFrequency }).returning();

	const [goal] = result;

	return {
		goal,
	};
};
