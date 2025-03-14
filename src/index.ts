#!/usr/bin/env node

// src/index.ts

import { handleLatestMigration } from "@/copy-migration";
import { resolveMigrationsPath } from "@/utils/path-utils";
import { getConfig } from "@/config";
import { CLI_FLAGS } from "@/config/constants";

async function main() {
  const config = getConfig();
  const args = process.argv.slice(2);
  
  // Get database name from args or config
  const dbNameFromArgs = args.find((arg) => !arg.startsWith("-"));
  const dbName = dbNameFromArgs || config.dbName;
  
  // Get auto-confirm flag from args or config
  const autoConfirm = args.some(arg => CLI_FLAGS.AUTO.includes(arg as any)) || config.autoConfirm;
  
  // Get migrations directory from args
  const migrationsDirArg = args
    .find((arg) => arg.startsWith(CLI_FLAGS.MIGRATIONS_DIR))
    ?.split("=")[1];

  // Use the resolveMigrationsPath utility to find the migrations directory
  const migrationsDir = await resolveMigrationsPath(migrationsDirArg);

  console.log({ dbName, autoConfirm, migrationsDir });
  await handleLatestMigration({ migrationsDir, dbName, autoConfirm });
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  if (process.env.NODE_ENV !== "test") process.exit(1);
});
