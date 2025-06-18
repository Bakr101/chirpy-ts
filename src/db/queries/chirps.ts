import { db } from "../index.js";
import { chirps, type NewChirp } from "../schema.js";
import { asc, desc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
    const [newChirp] = await db.insert(chirps).values(chirp).returning();
    return newChirp;
}

export async function deleteAllChirps() {
    await db.delete(chirps);
}

export async function getAllChirps(sortOrder: string | undefined = undefined) {
    if (sortOrder === "asc" || sortOrder === "desc") {
        const allChirps = await db.select().from(chirps).orderBy(sortOrder === "asc" ? chirps.createdAt : desc(chirps.createdAt));
        return allChirps;
    } else {
        const allChirps = await db.select().from(chirps);
        return allChirps;
    }
}

export async function getChirp(chirpId: string) {
    const [chirp] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return chirp;
}

export async function deleteChirp(chirpId: string) {
    const [deletedChirp] = await db.delete(chirps).where(eq(chirps.id, chirpId)).returning();
    return deletedChirp;
}

export async function getChirpsByAuthorId(authorId: string) {
    const authorChirps = await db.select().from(chirps).where(eq(chirps.userId, authorId));
    return authorChirps;
}