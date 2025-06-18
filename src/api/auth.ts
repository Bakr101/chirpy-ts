import { BadRequestError, UnauthorizedError } from "./error.js";
import { config } from "../config.js";
import { getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth/auth.js";
import { respondWithJson } from "./json.js";
import { Request, Response } from "express";
import { NewUser } from "../db/schema.js";
import { getUserFromRefreshToken, newRefreshToken, revokeRefreshToken } from "../db/queries/refresh_tokens.js";

type User = Omit<NewUser, "hashedPassword">;
type Tokens = {
    token: string;
    refreshToken: string;
}

type UserResponse = User & Tokens;

type LoginParams = {
    email: string;
    password: string;
}



//seconds
const EXPIRES_IN = 3600;
const REFRESH_TOKEN_EXPIRES_IN = 60 * 24 * 60 * 60;

export async function handlerLogin(req: Request, res: Response) {
    const params: LoginParams = req.body;
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
    const jwtSecret = config.APIConfig.jwtSecret;
    const accessToken = makeJWT(user.id, EXPIRES_IN, jwtSecret);
    const refreshToken = makeRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);
    const refreshTokenResult = await newRefreshToken(refreshToken, user.id, refreshTokenExpiry);
    if (!refreshTokenResult) {
        throw new Error("Failed to create refresh token in database");
    }

    const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
        refreshToken: refreshTokenResult.token,
        isChirpyRed: user.isChirpyRed,
    }
    respondWithJson(res, 200, userResponse);

}

type RefreshTokenResponse = {
    token: string;
}

export async function handlerRefresh(req: Request, res: Response) {
    const token = getBearerToken(req);
    const user = await getUserFromRefreshToken(token);
    if (!user || !user.id) {
        throw new UnauthorizedError("Invalid refresh token");
    }
    if (user.revokedAt !== null) {
        throw new UnauthorizedError("Refresh token revoked");
    }
    if (user.expiresAt < new Date()) {
        throw new UnauthorizedError("Refresh token expired");
    }
    const jwtSecret = config.APIConfig.jwtSecret;
    const accessToken = makeJWT(user.id, EXPIRES_IN, jwtSecret);
    let response: RefreshTokenResponse = {
        token: accessToken,
    }
    respondWithJson(res, 200, response);
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const result = await revokeRefreshToken(refreshToken);
    if (!result || !result.token) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    console.log("revoked refresh token", result.revokedAt);
    res.status(204).send();
}