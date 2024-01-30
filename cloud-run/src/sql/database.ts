import { DB } from "../../kysely/db";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

// TODO: Make the function as dialect only call once per connection

let poolInstance: Pool;

const createPool = () => {
  return new Pool({
    database: process.env.DB_NAME,
    host: process.env.CLOUD_SQL_CONNECTION_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    max: 40,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
  });
};

const getPoolInstance = () => {
  if (!poolInstance) {
    poolInstance = createPool();
  }
  return poolInstance;
};

const dialect = new PostgresDialect({
  pool: async () => getPoolInstance(),
});

export function getSQLClient() {
  return new Kysely<DB>({
    dialect,
  });
}
