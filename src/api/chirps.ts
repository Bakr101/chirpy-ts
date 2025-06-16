import type { Request, Response } from "express";
import { respondWithError, respondWithJson } from "./json.js";
import { BadRequestError } from "./error.js";
import { createChirp, getAllChirps, getChirp } from "../db/queries/chirps.js";
import { getUser } from "../db/queries/users.js";

type RequestBody = {
    body: string;
    userId: string;
}
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
    const chirps = await getAllChirps();
    respondWithJson(res, 200, chirps);
}

export async function handlerCreateChirp(req: Request, res: Response) {
    const requestBody: RequestBody = req.body;
    console.log(requestBody);
    const validatedChirp = await chirpValidate(requestBody);
    const newChirp = await createChirp(validatedChirp);
    if (!newChirp) {
        respondWithError(res, 500, "Failed to create chirp");
        return;
    }
    respondWithJson(res, 201, newChirp);
}

export async function chirpValidate(chirp: RequestBody) {
    if (!chirp.body) {
        throw new BadRequestError("No chirp was provided");
    }
    if (chirp.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140")
    }
    if (!chirp.userId) {
        throw new BadRequestError("User ID is required");
    }
    const user = await getUser(chirp.userId);
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


