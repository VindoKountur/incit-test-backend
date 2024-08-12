import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DB_HOST as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    database: process.env.DB_NAME as string,
  },
  migrations: {
    table: "db_migrations",
    schema: "public",
  },
});
