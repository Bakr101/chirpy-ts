import { db } from "../index.js";
import { refreshTokens, users, type NewRefreshToken } from "../schema.js";
import { eq } from "drizzle-orm";

export async function newRefreshToken(token: string, userId: string, expiresAt: Date) {
    const refreshToken: NewRefreshToken = {
        token,
        userId,
        expiresAt,
    }
    const [result] = await db.insert(refreshTokens).values(refreshToken).returning();
    return result;
}

export async function getRefreshToken(token: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return result;
}

export async function revokeRefreshToken(token: string) {
    const [result] = await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.token, token)).returning();
    return result;
}

export async function getUserFromRefreshToken(token: string) {
    const [result] = await db.select({
        id: users.id,
        email: users.email,
        hashedPassword: users.hashedPassword,
        expiresAt: refreshTokens.expiresAt,
        revokedAt: refreshTokens.revokedAt,
        token: refreshTokens.token,
    }).from(refreshTokens).leftJoin(users, eq(refreshTokens.userId, users.id)).where(eq(refreshTokens.token, token));
    return result;
}

