#!/usr/bin/env node

// src/index.ts

import path from "path";
import { handleLatestMigration } from "@/copy-migration";

// utils could be useful here for:
// - getting config
// - getting db name from args
// - getting migrations dir from args
// - getting auto confirm from args
// - getting db name from config
// - getting migrations dir from config

async function main() {
  const args = process.argv.slice(2);
  const dbNameFromArgs = args.find((arg) => !arg.startsWith("-"));
  const dbName = dbNameFromArgs || "image-resizer";
  const autoConfirm = args.includes("--auto") || args.includes("-a");
  const migrationsDirArg = args
    .find((arg) => arg.startsWith("--migrations-dir="))
    ?.split("=")[1];

  const rootDir = path.resolve(__dirname, "..", "..", "..");
  const migrationsDir =
    migrationsDirArg || path.join(rootDir, "prisma", "migrations");

  console.log({ dbName, autoConfirm, migrationsDirArg });
  await handleLatestMigration({ migrationsDir, dbName, autoConfirm });
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  if (process.env.NODE_ENV !== "test") process.exit(1);
});
