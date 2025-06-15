import type { Request, Response, NextFunction } from "express";
import { config } from "../index.js";


export function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    })
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.APIConfig.fileserverHits++;
    next();
}