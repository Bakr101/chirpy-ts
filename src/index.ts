import express, { NextFunction, Request, Response } from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerCreateChirp, handlerGetChirps, handlerGetChirp } from "./api/chirps.js";
import { handlerLogin, handlerUserCreate } from "./api/users.js";
import { respondWithError } from "./api/json.js";
import { errorHandler } from "./api/error.js";
import { config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";



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
app.get("/api/chirps", async (req, res, next) => {
    try {
        await handlerGetChirps(req, res);
    } catch (error) {
        next(error);
    }
});

app.get("/api/chirps/:chirpID", async (req, res, next) => {
    try {
        await handlerGetChirp(req, res);
    } catch (error) {
        next(error);
    }
});
app.post("/api/chirps", async (req, res, next) => {
    try {
        await handlerCreateChirp(req, res);
    } catch (error) {
        next(error);
    }
});
app.post("/api/users", async (req, res, next) => {
    try {
        await handlerUserCreate(req, res);
    } catch (error) {
        next(error);
    }
});
app.post("/api/login", async (req, res, next) => {
    try {
        await handlerLogin(req, res);
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
