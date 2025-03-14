// src/constants.ts

export const DEFAULT_CONFIG_FILENAME = 'default-config.json';
export const DEFAULT_ENV_FILENAME = '.env';
export const DEFAULT_MIGRATIONS_DIR = 'prisma/migrations';
export const DEFAULT_DB_NAME = 'your-db-name';
export const DEFAULT_PORT = 3000;

export const MIGRATION_LOCK_FILE = 'migration_lock.toml';
export const MIGRATION_SQL_FILE = 'migration.sql';

export const CLI_FLAGS = {
  AUTO: ['--auto', '-a'],
  MIGRATIONS_DIR: '--migrations-dir='
} as const;

export const ERROR_MESSAGES = {
  NO_MIGRATIONS: 'No valid migration folders found. Ensure migration folders follow the format YYYYMMDDHHMMSS_name.',
  MISSING_MIGRATION: (path: string) => `Migration SQL file not found at: ${path}`,
  READ_DIR_ERROR: (err: string) => `Failed to read migrations directory: ${err}`,
} as const;