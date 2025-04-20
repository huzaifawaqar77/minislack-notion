import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { url, db_port, host, db_password } from "../config/environment";
import { Database } from "../types/databaseTypes";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: "postgres",
    host: host,
    user: "postgres",
    password: db_password,
    port: parseInt(db_port ?? "5432"),
    max: 10,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
