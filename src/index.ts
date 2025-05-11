import express from "express";

import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponse, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";

const app = express();
const PORT = 8080;



// express endpoints
app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("api/metrics", handlerMetrics);
app.get("api/healthz", handlerReadiness);
app.get("api/reset", handlerReset);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});
