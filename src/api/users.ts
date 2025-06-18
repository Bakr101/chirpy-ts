import type { Request, Response } from "express";
import { respondWithJson } from "./json.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./error.js";
import { getUser } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth/auth.js";
import { config } from "../config.js";

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
        isChirpyRed: user.isChirpyRed,
    }
    respondWithJson(res, 201, userResponse);
}

type UserUpdateParams = {
    email: string;
    password: string;
}

export async function handlerUserUpdate(req: Request, res: Response) {
    const params: UserUpdateParams = req.body;
    const email = params.email;
    const password = params.password;
    let hashedPassword = await hashPassword(password)
    if (!email) {
        throw new BadRequestError("Email is required");
    }
    if (!password) {
        throw new BadRequestError("Password is required");
    }

    const token = getBearerToken(req);
    const userID = validateJWT(token, config.APIConfig.jwtSecret)
    const user = await getUser(userID)

    const updatedUser = await updateUser(user.id, email, hashedPassword);
    if (!updatedUser) {
        throw new Error("Failed to update user");
    }
    let response: UserResponse
    response = {
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        id: updatedUser.id,
        isChirpyRed: updatedUser.isChirpyRed,
    }
    respondWithJson(res, 200, updatedUser);
}