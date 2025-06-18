import { pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 256 }).notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").notNull().default(false),
})

export type NewUser = typeof users.$inferInsert;

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    body: varchar("body", { length: 140 }).notNull(),
    userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
})

export type NewChirp = typeof chirps.$inferInsert;

export const refreshTokens = pgTable("refresh_tokens", {
    token: varchar("token", { length: 256 }).notNull().primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("userId").references(() => users.id, { onDelete: "cascade" }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at").default(sql`NULL`),
})

export type NewRefreshToken = typeof refreshTokens.$inferInsert;