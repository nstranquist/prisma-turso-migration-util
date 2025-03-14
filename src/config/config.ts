// src/config/config.ts

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  DEFAULT_CONFIG_FILENAME,
  DEFAULT_ENV_FILENAME,
  DEFAULT_MIGRATIONS_DIR,
  DEFAULT_DB_NAME,
  DEFAULT_PORT
} from "@/config/constants";

export interface ConfigDefaults {
  configFilename: string;
  envFilename: string;
  migrationsDir: string;
  dbName: string;
  autoConfirm: boolean;
  port: number;
}

export const defaults: ConfigDefaults = {
  configFilename: DEFAULT_CONFIG_FILENAME,
  envFilename: DEFAULT_ENV_FILENAME,
  migrationsDir: DEFAULT_MIGRATIONS_DIR,
  dbName: DEFAULT_DB_NAME,
  autoConfirm: false,
  port: DEFAULT_PORT,
};

export interface AppConfig {
  DATABASE_URL?: string;
  API_KEY?: string;
  PORT?: number;
  migrationsDir?: string;
  dbName?: string;
  autoConfirm?: boolean;
}

export const configSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid URL")
    .optional()
    .default("mongodb://localhost:27017"),
  API_KEY: z.string().optional(),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 65535, {
      message: "PORT must be a valid number between 0 and 65535",
    })
    .optional()
    .default(String(DEFAULT_PORT)),
  migrationsDir: z.string().optional().default(DEFAULT_MIGRATIONS_DIR),
  dbName: z.string().optional().default(DEFAULT_DB_NAME),
  autoConfirm: z.boolean().optional().default(false)
});

export type AppConfigSchema = z.infer<typeof configSchema>;

const loadConfigFromFile = (filePath: string): Record<string, string | undefined> => {
  try {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading config from ${filePath}:`, error);
    return {};
  }
};

const loadConfigFromEnv = (envPath: string): Record<string, string | undefined> => {
  try {
    if (!fs.existsSync(envPath)) return {};
    const result = dotenv.config({ path: envPath });
    if (result.error) throw result.error;
    return result.parsed || {};
  } catch (error) {
    console.error(`Error loading env from ${envPath}:`, error);
    return {};
  }
};

const config = (() => {
  const rawConfig: Record<string, string | undefined> = {};
  const envPath = path.join(process.cwd(), DEFAULT_ENV_FILENAME);
  const configPath = path.join(process.cwd(), DEFAULT_CONFIG_FILENAME);

  // Load from both sources, env takes precedence
  Object.assign(
    rawConfig,
    loadConfigFromFile(configPath),
    loadConfigFromEnv(envPath)
  );

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation failed:");
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Invalid configuration. See errors above.");
    }
    throw error;
  }
})();

export function getConfig(): AppConfig {
  return config;
}