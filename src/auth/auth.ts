import { compare, hash } from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../api/error.js";
import type { Request } from "express";
import crypto from "node:crypto";

const TOKEN_ISSUER = "chirpy";
export async function hashPassword(password: string) {
    return await hash(password, 10);
}

export async function checkPasswordHash(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const payload: payload = {
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: issuedAt,
        exp: expiresAt,
    } satisfies payload;
    return jwt.sign(payload, secret, { algorithm: "HS256" });
}

export function validateJWT(token: string, secret: string): string {
    let decoded: payload;
    try {
        decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        console.error(error);
        throw new UnauthorizedError("Invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UnauthorizedError("Invalid token");
    }
    if (!decoded.sub) {
        throw new UnauthorizedError("Invalid token");
    }
    return decoded.sub;
}

export function getBearerToken(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new UnauthorizedError("No authorization header");
    }
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer") {
        throw new UnauthorizedError("Invalid authorization header");
    }
    return token;
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(request: Request) {
    const authHeader = request.headers["authorization"];
    console.log(authHeader);
    if (!authHeader) {
        throw new UnauthorizedError("No authorization header");
    }
    const [type, apiKey] = authHeader.split(" ");
    if (type !== "ApiKey") {
        throw new UnauthorizedError("Invalid authorization header");
    }
    return apiKey;
}