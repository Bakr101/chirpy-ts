import { Request, Response } from "express";
import { getUser, updateUserIsChirpyRed } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./error.js";
import { NewUser } from "../db/schema.js";
import { respondWithJson } from "./json.js";
import { getAPIKey } from "../auth/auth.js";
import { config } from "../config.js";

type polkaWebhookRequest = {
    event: string;
    data: {
        userId: string;
    }
}

type polkaWebhookResponse = Omit<NewUser, "hashedPassword">;

export async function handlerPolkaWebhook(req: Request, res: Response) {
    const apiKey = getAPIKey(req);
    if (apiKey !== config.APIConfig.polkaAPIKey) {
        throw new UnauthorizedError("Invalid API key");
    }
    const requestBody: polkaWebhookRequest = req.body;
    if (requestBody.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }
    const userId = requestBody.data.userId;
    const user = await getUser(userId);
    if (!user || !user.id) {
        throw new NotFoundError("User not found");
    }
    const updatedUser = await updateUserIsChirpyRed(user.id);
    const userResponse: polkaWebhookResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        isChirpyRed: updatedUser.isChirpyRed,
    }
    respondWithJson(res, 204, userResponse);
}