import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { config } from "../index.js";

const conn = postgres(config.DBConfig.dbURL);
export const db = drizzle(conn, { schema });