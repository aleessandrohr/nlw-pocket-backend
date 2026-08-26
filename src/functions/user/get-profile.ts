import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/utils/logger";
import { eq } from "drizzle-orm";
import { AuthenticationError } from "../errors/authentication-error";

interface GetProfileRequest {
	userId: string;
}

export const getProfile = async ({ userId }: GetProfileRequest) => {
	// Expõe o estado demo para o frontend manter a identificação após recarregar a página.
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			id: true,
			name: true,
			email: true,
			isDemo: true,
			demoExpiresAt: true,
			updatedAt: true,
			createdAt: true,
		},
	});

	if (!user) throw new AuthenticationError();

	logger.debug("user profile found");

	return {
		user,
	};
};
