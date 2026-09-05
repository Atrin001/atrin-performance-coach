CREATE TABLE `user_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`state_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
