ALTER TABLE "goal_completions" DROP CONSTRAINT "goal_completions_goal_id_goals_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "demo_expires_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_completions" ADD CONSTRAINT "goal_completions_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
