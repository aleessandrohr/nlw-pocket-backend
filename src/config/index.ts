import type { CookieSerializeOptions } from "@fastify/cookie";

export * from "./regex";

export const SALT_ROUNDS = 10;

export const REFRESH_TOKEN_SIZE = 64;
export const REFRESH_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60; // 7 days
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict",
	maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
};

export const ACCESS_TOKEN_EXPIRATION_TIME = "15m";
export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict",
	maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
};

export const CSRF_TOKEN_COOKIE_NAME = "_csrf";
export const CSRF_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	signed: true,
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict",
};
