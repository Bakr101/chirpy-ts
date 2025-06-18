import { db } from "../index.js";
import { users, type NewUser } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(email: string, hashedPassword: string) {
    const user: NewUser = {
        email,
        hashedPassword,
    }
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function deleteUsers() {
    await db.delete(users);
}

export async function getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
}

export async function getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
}

export async function updateUser(id: string, email: string, hashedPassword: string) {
    const [user] = await db.update(users).set({ email, hashedPassword }).where(eq(users.id, id)).returning();
    return user;
}

export async function updateUserIsChirpyRed(id: string) {
    const [user] = await db.update(users).set({ isChirpyRed: true }).where(eq(users.id, id)).returning();
    return user;
}