import type { Request, Response } from "express";
import { config } from "../index.js";

export function handlerMetrics(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.write(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.APIConfig.fileserverHits} times!</p>
            </body>
        </html>
    `);
    res.end();
}