import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userState = sqliteTable("user_state", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  stateJson: text("state_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
