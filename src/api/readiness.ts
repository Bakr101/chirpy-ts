import type { Request, Response } from "express";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
    res.end();
};