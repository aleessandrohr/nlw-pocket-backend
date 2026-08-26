import { SALT_ROUNDS } from "@/config";
import bcrypt from "bcryptjs";

// Mantém o custo de comparação mesmo quando o e-mail informado não existe.
export const PASSWORD_TIMING_HASH =
	"$2b$10$yyjh4yrPyEE6DVK7ipRB9ey/21G3A9Zo.XtdQdhuXUefJI9D4yKEW";

export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string) => {
	const isPasswordCorrect = await bcrypt.compare(password, hash);

	return isPasswordCorrect;
};
