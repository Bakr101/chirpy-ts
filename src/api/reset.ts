import type { Request, Response } from "express";
import { config } from "../index.js";

export function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0;
    res.write("Hits reset to 0");
    res.end();
}