import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./error.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, hashPassword } from "../auth/auth.js";

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUserCreate(req: Request, res: Response) {
    const params = req.body;
    const email = params.email;
    const password = params.password;
    if (!email) {
        throw new BadRequestError("Email is required");
    }
    if (!password) {
        throw new BadRequestError("Password is required");
    }
    const hashedPassword = await hashPassword(password);
    let user: NewUser
    try {
        user = await createUser(email, hashedPassword);
    } catch (error) {
        if (error instanceof Error && error.message.includes("duplicate key value")) {
            throw new BadRequestError("Email already exists");
        }
        throw error;
    }
    let userResponse: UserResponse;
    userResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
    respondWithJson(res, 201, userResponse);
}

export async function handlerLogin(req: Request, res: Response) {
    const params = req.body;
    const email = params.email;
    const password = params.password;
    if (!email) {
        throw new BadRequestError("Email is required");
    }
    if (!password) {
        throw new BadRequestError("Password is required");
    }
    const user = await getUserByEmail(email);
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await checkPasswordHash(password, user.hashedPassword);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }
    const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
    respondWithJson(res, 200, userResponse);

}