import { NextFunction, Request, Response } from "express";
import { respondWithError } from "./json.js";


export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.message)
    switch (err.name) {
        case "BadRequestError":
            respondWithError(res, 400, err.message)
            break;
        case "UnauthorizedError":
            respondWithError(res, 401, err.message)
            break;
        case "ForbiddenError":
            respondWithError(res, 403, err.message)
            break;
        case "NotFoundError":
            respondWithError(res, 404, err.message)
            break;
        default:
            respondWithError(res, 500, "Something went wrong on our end")
            break;
    }
}

// Custom errors
// 400
export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
    }
}

// 401
export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnauthorizedError";
    }
}

// 403
export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ForbiddenError";
    }
}


// 404
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

