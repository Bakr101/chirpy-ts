import { db } from "../index.js";
import { chirps, type NewChirp } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
    const [newChirp] = await db.insert(chirps).values(chirp).returning();
    return newChirp;
}

export async function deleteAllChirps() {
    await db.delete(chirps);
}

export async function getAllChirps() {
    const allChirps = await db.select().from(chirps).orderBy(chirps.createdAt);
    return allChirps;
}

export async function getChirp(chirpId: string) {
    const [chirp] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return chirp;
}