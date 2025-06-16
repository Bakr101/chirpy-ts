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
