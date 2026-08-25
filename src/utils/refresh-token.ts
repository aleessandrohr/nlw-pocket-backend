import crypto from "crypto";
import {
	REFRESH_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_SIZE,
	SALT_ROUNDS,
} from "@/config";
import dayjs from "@/lib/dayjs";
import bcrypt from "bcryptjs";

export const generateRefreshToken = async () => {
	const refreshToken = crypto.randomBytes(REFRESH_TOKEN_SIZE).toString("hex");
	const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
	const refreshTokenExpiresAt = dayjs()
		.add(REFRESH_TOKEN_EXPIRATION_TIME, "seconds")
		.toDate();

	return {
		refreshToken,
		hashedRefreshToken,
		refreshTokenExpiresAt,
	};
};

export const verifyRefreshToken = async (
	refreshToken: string,
	hashedRefreshToken: string
) => {
	const isRefreshTokenValid = await bcrypt.compare(
		refreshToken,
		hashedRefreshToken
	);

	return isRefreshTokenValid;
};
