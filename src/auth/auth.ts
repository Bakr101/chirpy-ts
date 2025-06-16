import { compare, hash } from "bcrypt";

export async function hashPassword(password: string) {
    return await hash(password, 10);
}

export async function checkPasswordHash(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword);
}