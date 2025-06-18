import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, validateJWT } from "./auth.js";
import { UnauthorizedError } from "../api/error.js";
import type { Request } from "express";

describe("Password Hashing", () => {
    const password1 = "correctPassword123!"
    const password2 = "anotherPassword456!"
    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    })
    it("should return false for the incorrect password", async () => {
        const result = await checkPasswordHash(password2, hash1);
        expect(result).toBe(false);
    })

})

describe("JWT Functions", () => {
    const secret = "test-secret";
    const invalidSecret = "invalid-secret";
    const userID = "123";
    let validJWT: string;
    let expiredJWT: string;

    beforeAll(() => {
        validJWT = makeJWT(userID, 3600, secret);
        expiredJWT = makeJWT(userID, -1000, secret);
    })
    it("should validate a valid JWT", () => {
        const result = validateJWT(validJWT, secret);
        expect(result).toBe(userID);
    })
    it("should throw an error for an invalid token", () => {
        expect(() => validateJWT("invalid", secret)).toThrow(UnauthorizedError);
    })
    it("should throw an error for an expired token", () => {
        expect(() => validateJWT(expiredJWT, secret)).toThrow(UnauthorizedError);
    })
    it("should throw an error for a token with an invalid signature", () => {
        expect(() => validateJWT(validJWT, invalidSecret)).toThrow(UnauthorizedError);
    })

})

describe("getBearerToken", () => {
    const request = {
        headers: {
            authorization: "Bearer 123"
        }
    } as Request;

    const invalidRequest = {
        headers: {
            authorization: "Basic 123"
        }
    } as Request;

    const noAuthRequest = {
        headers: {}
    } as Request;

    it("should return the token from the Authorization header", () => {
        const token = getBearerToken(request);
        expect(token).toBe("123");
    })

    it("should throw an error for a request with no Authorization header", () => {
        expect(() => getBearerToken(noAuthRequest)).toThrow(UnauthorizedError);
        expect(() => getBearerToken(noAuthRequest)).toThrow("No authorization header");
    })

    it("should throw an error for a request with an invalid Authorization header", () => {
        expect(() => getBearerToken(invalidRequest)).toThrow(UnauthorizedError);
        expect(() => getBearerToken(invalidRequest)).toThrow("Invalid authorization header");
    })
})


describe("getAPIKey", () => {
    const request = {
        headers: {
            authorization: "ApiKey 123"
        }
    } as Request;

    const invalidRequest = {
        headers: {
            authorization: "Basic 123"
        }
    } as Request;

    const noAuthRequest = {
        headers: {}
    } as Request;

    it("should return the API key from the Authorization header", () => {
        const apiKey = getAPIKey(request);
        expect(apiKey).toBe("123");
    })

    it("should throw an error for a request with no Authorization header", () => {
        expect(() => getAPIKey(noAuthRequest)).toThrow(UnauthorizedError);
        expect(() => getAPIKey(noAuthRequest)).toThrow("No authorization header");
    })

    it("should throw an error for a request with an invalid Authorization header", () => {
        expect(() => getAPIKey(invalidRequest)).toThrow(UnauthorizedError);
        expect(() => getAPIKey(invalidRequest)).toThrow("Invalid authorization header");
    })
})