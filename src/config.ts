import type { MigrationConfig } from "drizzle-orm/migrator";
import { envOrThrow } from "./utils.js";

export type Config = {
    APIConfig: APIConfig;
    DBConfig: DBConfig;
}
type DBConfig = {
    dbURL: string;
    migrations: MigrationConfig;
}
export type APIConfig = {
    fileserverHits: number;
    platform: string;
}

process.loadEnvFile();
const dbURL = envOrThrow("DB_URL");
const platform = envOrThrow("PLATFORM");

export const config: Config = {
    APIConfig: {
        fileserverHits: 0,
        platform,
    },
    DBConfig: {
        dbURL,
        migrations: {
            migrationsFolder: "./src/db/migrations",
        },
    },
}