import { AppError } from "./app-error";

export class AuthenticationError extends AppError {
	constructor(message = "invalid credentials") {
		super(message, 401);
	}
}
