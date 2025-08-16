import { SALT_ROUNDS } from "@/config";
import { AuthenticationError } from "@/functions/errors/authentication-error";
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string) => {
	const isPasswordCorrect = await bcrypt.compare(password, hash);

	return isPasswordCorrect;
};
