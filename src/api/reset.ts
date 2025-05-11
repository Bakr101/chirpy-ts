import type { Request, Response } from "express";
import { config } from "../config.js";

export function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0;
    res.sendStatus(200);
    res.end();
}