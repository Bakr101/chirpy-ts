import type { MigrationConfig } from "drizzle-orm/migrator";

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
}
