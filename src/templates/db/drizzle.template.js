/** @format */

"use strict";

function drizzleTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return {
      dbConfig: `import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env.config';
import { logger } from './logger.config';
import * as schema from '../db/schema';

let pool: Pool;
export let db: ReturnType<typeof drizzle>;

export async function connectDB(): Promise<void> {
  try {
    pool = new Pool({ connectionString: env.DATABASE_URL });
    await pool.connect();
    db = drizzle(pool, { schema });
    logger.info('✅ PostgreSQL (Drizzle) connected successfully');
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
}
`,
      drizzleConfig: `import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env.config';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
`,
      schema: `import { pgTable, varchar, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false),
${cfg.auth === "jwt-refresh" ? "  refreshToken: varchar('refresh_token', { length: 255 }),\n" : ""}  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
`,
    };
  }

  // JavaScript — ESM
  // Use ESM live-binding: export let db; reassign in connectDB()
  return {
    dbConfig: `import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env.config.js';
import { logger } from './logger.config.js';
import * as schema from '../db/schema.js';

// ESM live-binding: importers always get the current value of \`db\`
export let db;

let pool;

export async function connectDB() {
  try {
    pool = new Pool({ connectionString: env.DATABASE_URL });
    await pool.connect();
    db = drizzle(pool, { schema });
    logger.info('✅ PostgreSQL (Drizzle) connected successfully');
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
}
`,
    drizzleConfig: `import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env.config.js';

export default defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
`,
    schema: `import { pgTable, varchar, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false),
${cfg.auth === "jwt-refresh" ? "  refreshToken: varchar('refresh_token', { length: 255 }),\n" : ""}  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`,
  };
}

module.exports = { drizzleTemplate };
