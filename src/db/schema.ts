import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: text("id")
			.primaryKey()
			.$default(() => createId()),
		name: varchar("name", { length: 255 }).notNull(),
		email: varchar("email", { length: 256 }).notNull().unique(),
		password: text("password").notNull(),
		isDemo: boolean("is_demo").notNull().default(false),
		demoExpiresAt: timestamp("demo_expires_at", { withTimezone: true }),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	table => [
		// Impede contas diferentes que variam apenas por maiúsculas no e-mail.
		uniqueIndex("users_email_lower_unique").on(sql`lower(${table.email})`),
		// Garante que toda conta demo possa ser invalidada pelo prazo definido.
		check(
			"users_demo_expiration_check",
			sql`not ${table.isDemo} or ${table.demoExpiresAt} is not null`
		),
	]
);

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

export const goals = pgTable(
	"goals",
	{
		id: text("id")
			.primaryKey()
			.$default(() => createId()),
		userId: text("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		title: text("title").notNull(),
		desiredWeeklyFrequency: integer("desired_weekly_frequency").notNull(),
		isArchived: boolean("is_archived").notNull().default(false),
		archivedAt: timestamp("archived_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	table => [
		// Protege o domínio mesmo quando a alteração não passa pelo contrato HTTP.
		check("goals_title_not_blank", sql`char_length(btrim(${table.title})) > 0`),
		check(
			"goals_desired_weekly_frequency_range",
			sql`${table.desiredWeeklyFrequency} between 1 and 7`
		),
		check(
			"goals_archive_state_consistency",
			sql`(${table.isArchived} and ${table.archivedAt} is not null) or (not ${table.isArchived} and ${table.archivedAt} is null)`
		),
		index("goals_user_archived_idx").on(table.userId, table.isArchived),
	]
);

export const goalCompletions = pgTable(
	"goal_completions",
	{
		id: text("id")
			.primaryKey()
			.$default(() => createId()),
		goalId: text("goal_id")
			.references(() => goals.id, { onDelete: "cascade" })
			.notNull(),
		isArchived: boolean("is_archived").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	table => [
		index("goal_completions_goal_archived_created_idx").on(
			table.goalId,
			table.isArchived,
			table.createdAt
		),
	]
);

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
