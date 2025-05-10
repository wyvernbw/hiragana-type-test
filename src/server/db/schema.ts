// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hiragana-rewrite_${name}`);

export const usersTable = createTable("users", (d) => ({
  id: d.text().primaryKey().notNull(),
  username: d.text().notNull(),
  email: d.text().notNull().unique(),
  password: d.text().notNull(),
}));

export const sessionsTable = createTable("sessions", (d) => ({
  id: d.text().primaryKey().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => usersTable.id),
  lastUsed: d.date().defaultNow(),
}));

export const scoresTable = createTable("scores", (d) => ({
  id: d.text().primaryKey().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => usersTable.id),
  wpm: d.real().notNull(),
  acc: d.real().notNull(),
  timestamp: d.timestamp().defaultNow().notNull(),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  scores: many(scoresTable),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const scoresRelations = relations(scoresTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [scoresTable.userId],
    references: [usersTable.id],
  }),
}));
