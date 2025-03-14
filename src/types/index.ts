// src/types.ts

export interface MigrationFolder {
  name: string;
  time: number;
}

export interface MigrationOptions {
  migrationsDir: string;
  dbName?: string;
  autoConfirm?: boolean;
}

export interface CLIArguments {
  dbName: string;
  autoConfirm: boolean;
  migrationsDir: string;
}

export type CommandExecutor = (command: string) => Promise<string>;