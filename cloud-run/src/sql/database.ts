import { DB } from "../../kysely/db";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";


const dialect = new PostgresDialect({
  pool: async () =>
    new Pool({
      database: process.env.DB_NAME,
      host: process.env.CLOUD_SQL_CONNECTION_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      max: 10,
      connectionTimeoutMillis: 3000,
    }),
});

export function getSQLClient() {
  return new Kysely<DB>({
    dialect,
  });
}