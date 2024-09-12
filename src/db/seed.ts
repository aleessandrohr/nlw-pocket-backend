import { db, client } from "@/db";
import { goals, goalCompletions } from "@/db/schema";
import dayjs from "dayjs";

const seed = async () => {
	await db.delete(goalCompletions);
	await db.delete(goals);

	const goalsResult = await db
		.insert(goals)
		.values([
			{
				title: "Acordar cedo",
				desiredWeeklyFrequency: 5,
			},
			{
				title: "Me exercitar",
				desiredWeeklyFrequency: 3,
			},
			{
				title: "Meditar",
				desiredWeeklyFrequency: 1,
			},
		])
		.returning();

	const startOfWeek = dayjs().startOf("week");

	await db.insert(goalCompletions).values(
		goalsResult.map((goalResult, index) => ({
			goalId: goalResult.id,
			createdAt: startOfWeek.add(index, "day").toDate(),
		}))
	);
};

seed().finally(() => {
	client.end();
});
