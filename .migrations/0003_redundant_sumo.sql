CREATE INDEX "goal_completions_goal_archived_created_idx" ON "goal_completions" USING btree ("goal_id","is_archived","created_at");--> statement-breakpoint
CREATE INDEX "goals_user_archived_idx" ON "goals" USING btree ("user_id","is_archived");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_title_not_blank" CHECK (char_length(btrim("goals"."title")) > 0);--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_desired_weekly_frequency_range" CHECK ("goals"."desired_weekly_frequency" between 1 and 7);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_demo_expiration_check" CHECK (not "users"."is_demo" or "users"."demo_expires_at" is not null);