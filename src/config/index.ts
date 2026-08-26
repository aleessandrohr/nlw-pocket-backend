import type { CookieSerializeOptions } from "@fastify/cookie";

export * from "./regex";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const SALT_ROUNDS = 10;

export const REFRESH_TOKEN_SIZE = 64;
export const REFRESH_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60; // 7 days
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	path: "/",
	httpOnly: true,
	secure: IS_PRODUCTION,
	sameSite: "strict",
	maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
};

export const ACCESS_TOKEN_EXPIRATION_TIME = "15m";
export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	path: "/",
	httpOnly: true,
	secure: IS_PRODUCTION,
	sameSite: "strict",
	maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
};

export const DEMO_EXPIRATION_TIME = 60 * 60; // 1 hora

export const CSRF_TOKEN_COOKIE_NAME = "_csrf";
export const CSRF_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
	signed: true,
	path: "/",
	httpOnly: true,
	secure: IS_PRODUCTION,
	sameSite: "strict",
};

// Restringe abuso de endpoints públicos que criam ou renovam sessões.
export const AUTH_RATE_LIMITS = {
	login: { max: 5, timeWindow: "15 minutes" },
	register: { max: 3, timeWindow: "1 hour" },
	demo: { max: 5, timeWindow: "15 minutes" },
	refresh: { max: 30, timeWindow: "1 minute" },
} as const;
