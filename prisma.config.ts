import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Prisma CLI does not read .env.local automatically
config({ path: path.join(process.cwd(), ".env.local") });

const baseUrl = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: { url: baseUrl },
});
