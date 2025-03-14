// src/utils/path-utils.ts

import path from 'path';
import fs from 'fs/promises';
import { getConfig } from '@/config';
import { DEFAULT_MIGRATIONS_DIR } from '@/config/constants';

/**
 * Resolves the migrations directory path
 * 
 * This function tries to find migrations in the following order:
 * 1. The specified custom path (if provided)
 * 2. The configured migrations directory from config
 * 3. The standard project path (prisma/migrations)
 * 4. If running as a package inside another project, it looks for migrations in the parent project
 * 5. For testing purposes, it can use mock migrations included in the package
 * 
 * @param customPath Optional custom path to migrations directory
 * @returns The resolved path to a migrations directory
 */
export const resolveMigrationsPath = async (customPath?: string): Promise<string> => {
  // If a custom path is provided, use it
  if (customPath) {
    try {
      await fs.access(customPath);
      return customPath;
    } catch (error) {
      console.warn(`Custom migrations path ${customPath} not found, falling back to defaults`);
    }
  }

  // Try the configured migrations directory from config
  const config = getConfig();
  const configuredPath = config.migrationsDir || DEFAULT_MIGRATIONS_DIR;
  const projectRoot = process.cwd();
  
  // If the configured path is absolute, use it directly
  const configuredFullPath = path.isAbsolute(configuredPath) 
    ? configuredPath 
    : path.join(projectRoot, configuredPath);
  
  try {
    await fs.access(configuredFullPath);
    return configuredFullPath;
  } catch (error) {
    // If configured path doesn't exist, try the standard path
    const standardPath = path.join(projectRoot, 'prisma', 'migrations');
    
    if (configuredFullPath !== standardPath) {
      try {
        await fs.access(standardPath);
        return standardPath;
      } catch (error) {
        // Continue to next fallback
      }
    }
    
    // If standard path doesn't exist, try one level up (for when running in bin/migration-util)
    const parentProjectPath = path.join(projectRoot, '..', '..', 'prisma', 'migrations');
    
    try {
      await fs.access(parentProjectPath);
      return parentProjectPath;
    } catch (error) {
      // Fall back to mock migrations
      const mockPath = path.join(projectRoot, 'test', 'fixtures', 'migrations');
      
      try {
        await fs.access(mockPath);
        return mockPath;
      } catch (error) {
        throw new Error('No migrations directory found. Please create one or specify a custom path.');
      }
    }
  }
};

/**
 * Gets the path to the mock migrations directory
 * 
 * @returns The absolute path to the mock migrations directory
 */
export const getMockMigrationsPath = (): string => {
  return path.join(process.cwd(), 'test', 'fixtures', 'migrations');
}; 