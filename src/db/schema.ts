import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 256 }).notNull().unique(),
	password: text("password").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const sessions = pgTable("sessions", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	userId: text("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 45 }).notNull(),
	hashedRefreshToken: text("hashed_refresh_token").notNull(),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		withTimezone: true,
	}).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const goals = pgTable("goals", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	userId: text("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull(),
	desiredWeeklyFrequency: integer("desired_weekly_frequency").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const goalCompletions = pgTable("goal_completions", {
	id: text("id")
		.primaryKey()
		.$default(() => createId()),
	goalId: text("goal_id")
		.references(() => goals.id)
		.notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
	user: one(users, {
		fields: [goals.userId],
		references: [users.id],
	}),
	completions: many(goalCompletions),
}));

export const goalCompletionsRelations = relations(
	goalCompletions,
	({ one }) => ({
		goal: one(goals, {
			fields: [goalCompletions.goalId],
			references: [goals.id],
		}),
	})
);
