import { client, db } from "@/db";
import { goalCompletions, goals } from "@/db/schema";
import dayjs from "@/lib/dayjs";

// deprecated
const seed = async () => {
	await db.delete(goalCompletions);
	await db.delete(goals);

	const goalsResult = await db
		.insert(goals)
		.values([
			{
				userId: "",
				title: "Acordar cedo",
				desiredWeeklyFrequency: 5,
			},
			{
				userId: "",
				title: "Me exercitar",
				desiredWeeklyFrequency: 3,
			},
			{
				userId: "",
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
