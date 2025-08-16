import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/utils/logger";
import { eq } from "drizzle-orm";
import { AuthenticationError } from "../errors/authentication-error";

interface GetProfileRequest {
	email: string;
}

export const getProfile = async ({ email }: GetProfileRequest) => {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
		columns: {
			id: true,
			name: true,
			email: true,
			updatedAt: true,
			createdAt: true,
		},
	});

	if (!user) throw new AuthenticationError();

	logger.debug({ user }, "user found");

	return {
		user,
	};
};
