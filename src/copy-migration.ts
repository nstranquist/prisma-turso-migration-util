// src/copy-migration.ts

import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import readline from "readline/promises";
import { stdin, stdout } from "process";

interface Config {
  migrationsDir: string;
  dbName?: string;
  autoConfirm?: boolean;
}

const parseTimestamp = (timestamp: string): number => {
  if (!/^\d{14}$/.test(timestamp)) return NaN;
  const year = parseInt(timestamp.slice(0, 4), 10);
  const month = parseInt(timestamp.slice(4, 6), 10) - 1;
  const day = parseInt(timestamp.slice(6, 8), 10);
  const hour = parseInt(timestamp.slice(8, 10), 10);
  const minute = parseInt(timestamp.slice(10, 12), 10);
  const second = parseInt(timestamp.slice(12, 14), 10);
  return new Date(year, month, day, hour, minute, second).getTime();
};

const runCommand = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve(stdout);
    });
  });

export async function handleLatestMigration({
  migrationsDir,
  dbName,
  autoConfirm = false,
}: Config): Promise<void> {
  try {
    console.log("Looking for migrations in:", migrationsDir);
    let directories;
    try {
      directories = await fs.readdir(migrationsDir, { withFileTypes: true });
    } catch (err: unknown) {
      throw new Error(
        `Failed to read migrations directory: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
    console.log(
      "Found directories:",
      directories.map((d) => ({ name: d.name, isDir: d.isDirectory() }))
    );

    const migrationFolders = directories
      .filter((dir) => dir.isDirectory() && dir.name !== "migration_lock.toml")
      .map((dir) => {
        const [timestamp, ...rest] = dir.name.split("_");
        return {
          name: dir.name,
          time: parseTimestamp(timestamp),
        };
      })
      .filter((migration) => !isNaN(migration.time));

    if (migrationFolders.length === 0) {
      console.log(
        "No valid migration folders found. Ensure migration folders follow the format YYYYMMDDHHMMSS_name."
      );
      return; // Exit gracefully instead of throwing
    }

    migrationFolders.sort((a, b) => b.time - a.time);
    const latestMigration = migrationFolders[0];
    const migrationPath = path.join(
      migrationsDir,
      latestMigration.name,
      "migration.sql"
    );

    try {
      await fs.access(migrationPath);
    } catch (err) {
      throw new Error(`Migration SQL file not found at: ${migrationPath}`);
    }

    const rl = readline.createInterface({ input: stdin, output: stdout });
    let action = "c";

    if (dbName && !autoConfirm) {
      console.log(`Latest migration found: ${migrationPath}`);
      action = await rl.question(
        "Choose an action: (c)opy path, (e)xecute with Turso, or (s)kip [c/e/s]: "
      );
    }

    rl.close();

    if ((action.toLowerCase() === "e" || autoConfirm) && dbName) {
      // const command = `turso db shell ${dbName} < ${migrationPath}`;
      const command = `cat ${migrationPath} | turso db shell ${dbName}`;
      console.log(`Executing: ${command}`);
      const output = await runCommand(command);
      console.log("Migration applied successfully!\n", output);
    } else if (action.toLowerCase() === "s") {
      console.log("Skipping migration handling.");
    } else {
      console.log(`✅ Migration path: ${migrationPath}`);
      if (dbName)
        console.log(
          `Suggested command: turso db shell ${dbName} < ${migrationPath}`
        );
      console.log("Copy the path above manually.");
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
    if (process.env.NODE_ENV !== "test") process.exit(1);
    throw error;
  }
}
