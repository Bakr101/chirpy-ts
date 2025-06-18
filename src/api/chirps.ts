import type { Request, Response } from "express";
import { respondWithError, respondWithJson } from "./json.js";
import { BadRequestError } from "./error.js";
import { createChirp, deleteChirp, getAllChirps, getChirp, getChirpsByAuthorId } from "../db/queries/chirps.js";
import { getUser } from "../db/queries/users.js";
import { getBearerToken, validateJWT } from "../auth/auth.js";
import { config } from "../config.js";
import { NewChirp } from "../db/schema.js";


const maxChirpLength = 140;

export async function handlerGetChirp(req: Request, res: Response) {
    const chirpId = req.params.chirpID;
    const chirp = await getChirp(chirpId);
    if (!chirp) {
        respondWithError(res, 404, "Chirp not found");
        return;
    }
    respondWithJson(res, 200, chirp);
}


export async function handlerGetChirps(req: Request, res: Response) {
    let chirps: NewChirp[];
    const authorId = req.query.authorId;
    const sortOrder = req.query.sort;
    if (authorId && typeof authorId === "string") {
        chirps = await getChirpsByAuthorId(authorId);
    } else if (sortOrder && typeof sortOrder === "string") {
        chirps = await getAllChirps(sortOrder);
    }
    else {
        chirps = await getAllChirps();
    }
    respondWithJson(res, 200, chirps);
}


export async function handlerDeleteChirp(req: Request, res: Response) {
    const chirpId = req.params.chirpID;
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.APIConfig.jwtSecret);
    const chirp = await getChirp(chirpId);
    if (!chirp) {
        respondWithError(res, 404, "Chirp not found");
        return;
    }
    if (chirp.userId !== userId) {
        respondWithError(res, 403, "You are not the owner of this chirp");
        return;
    }
    const deletedChirp = await deleteChirp(chirpId);
    if (!deletedChirp) {
        throw new Error("Failed to delete chirp");
    }
    respondWithJson(res, 204, deletedChirp);
}


type RequestBody = {
    body: string;
    token: string;
}
export async function handlerCreateChirp(req: Request, res: Response) {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.APIConfig.jwtSecret);
    if (!userId) {
        respondWithError(res, 401, "Invalid token");
        return;
    }
    const requestBody: RequestBody = req.body;
    console.log(requestBody);
    const validatedChirp = await chirpValidate(requestBody, userId);
    const newChirp = await createChirp(validatedChirp);
    if (!newChirp) {
        respondWithError(res, 500, "Failed to create chirp");
        return;
    }
    respondWithJson(res, 201, newChirp);
}

export async function chirpValidate(chirp: RequestBody, userId: string) {
    if (!chirp.body) {
        throw new BadRequestError("No chirp was provided");
    }
    if (chirp.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140")
    }

    const user = await getUser(userId);
    if (!user) {
        throw new BadRequestError("User not found");
    }
    const cleanedBody = sanitizeBody(chirp.body);
    return {
        body: cleanedBody,
        userId: user.id,
    }
}

function sanitizeBody(body: string) {
    const profaneWords = ["kerfuffle", "sharbert", "fornax"];
    const words = body.split(" ");
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const loweredWord = word.toLowerCase();
        if (profaneWords.includes(loweredWord)) {
            words[i] = "****";
        }
    }
    return words.join(" ");
}


