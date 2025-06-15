import type { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJson } from "./json.js";
import { BadRequestError, errorHandler } from "./error.js";

export async function handlerChirpsValidate(req: Request, res: Response, next: NextFunction) {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140")
    }
    const cleanedBody = sanitizeBody(params.body);

    respondWithJson(res, 200, { cleanedBody })

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
