import type { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./error.js";
import { deleteUsers } from "../db/queries/users.js";
import { deleteAllChirps } from "../db/queries/chirps.js";

export async function handlerReset(req: Request, res: Response) {
    if (config.APIConfig.platform !== "dev") {
        throw new ForbiddenError("Only available in dev mode");
    }
    await deleteUsers();
    await deleteAllChirps();
    config.APIConfig.fileserverHits = 0;
    res.write("Hits reset to 0 and users deleted");
    res.end();
}