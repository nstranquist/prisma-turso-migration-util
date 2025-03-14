// src/utils/test-utils.ts

import { resolveMigrationsPath as resolvePathFromUtils, getMockMigrationsPath as getMockPathFromUtils } from './path-utils';

/**
 * Determines if we're in a test environment
 * 
 * @returns True if we're in a test environment
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

/**
 * Re-export path utilities for backward compatibility
 */
export const resolveMigrationsPath = resolvePathFromUtils;
export const getMockMigrationsPath = getMockPathFromUtils;
