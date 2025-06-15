import express, { NextFunction, Request, Response } from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import { respondWithError } from "./api/json.js";
import { errorHandler } from "./api/error.js";
import type { Config } from "./config.js";
import { envOrThrow } from "./utils.js";
import process from "node:process";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

process.loadEnvFile();
const dbURL = envOrThrow("DB_URL");

export const config: Config = {
    APIConfig: {
        fileserverHits: 0,
    },
    DBConfig: {
        dbURL,
        migrations: {
            migrationsFolder: "./src/db/migrations",
        },
    },
}

const migrationClient = postgres(config.DBConfig.dbURL, { max: 1 });
await migrate(drizzle(migrationClient), config.DBConfig.migrations);


const app = express();
const PORT = 8080;
// express endpoints
app.use(middlewareLogResponse);
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
        respondWithError(res, 400, "Invalid JSON");
    } else {
        next(err);
    }
})
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", async (req, res, next) => {
    try {
        await handlerReadiness(req, res);
    } catch (error) {
        next(error);
    }
});
app.post("/api/validate_chirp", async (req, res, next) => {
    try {
        await handlerChirpsValidate(req, res, next);
    } catch (error) {
        next(error);
    }
});
app.post("/admin/reset", handlerReset);
app.get("/admin/metrics", handlerMetrics);
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});
