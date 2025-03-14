// src/utils/path-utils.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { resolveMigrationsPath, getMockMigrationsPath } from './path-utils';
import { getConfig } from '@/config';
import { DEFAULT_MIGRATIONS_DIR } from '@/config/constants';

// Mock fs.access and getConfig
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
  },
}));

vi.mock('@/config', () => ({
  getConfig: vi.fn(),
}));

describe('path-utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getConfig).mockReturnValue({
      migrationsDir: DEFAULT_MIGRATIONS_DIR,
    });
  });

  describe('resolveMigrationsPath', () => {
    it('should return the custom path if it exists', async () => {
      const customPath = '/custom/path';
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath(customPath);
      
      expect(result).toBe(customPath);
      expect(fs.access).toHaveBeenCalledWith(customPath);
    });

    it('should use the configured path from config if custom path does not exist', async () => {
      const customPath = '/custom/path';
      const configuredPath = '/configured/path';
      
      vi.mocked(getConfig).mockReturnValue({
        migrationsDir: configuredPath,
      });
      
      // Custom path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Configured path exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath(customPath);
      
      expect(result).toBe(configuredPath);
      expect(fs.access).toHaveBeenCalledWith(customPath);
      expect(fs.access).toHaveBeenCalledWith(configuredPath);
    });

    it('should fall back to standard path if configured path does not exist', async () => {
      const configuredPath = '/configured/path';
      const standardPath = path.join(process.cwd(), 'prisma', 'migrations');
      
      vi.mocked(getConfig).mockReturnValue({
        migrationsDir: configuredPath,
      });
      
      // Configured path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Standard path exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath();
      
      expect(result).toBe(standardPath);
      expect(fs.access).toHaveBeenCalledWith(configuredPath);
      expect(fs.access).toHaveBeenCalledWith(standardPath);
    });

    it('should check parent project path if standard path does not exist', async () => {
      const configuredPath = '/configured/path';
      const standardPath = path.join(process.cwd(), 'prisma', 'migrations');
      const parentPath = path.join(process.cwd(), '..', '..', 'prisma', 'migrations');
      
      vi.mocked(getConfig).mockReturnValue({
        migrationsDir: configuredPath,
      });
      
      // Configured path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Standard path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Parent path exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath();
      
      expect(result).toBe(parentPath);
      expect(fs.access).toHaveBeenCalledWith(configuredPath);
      expect(fs.access).toHaveBeenCalledWith(standardPath);
      expect(fs.access).toHaveBeenCalledWith(parentPath);
    });

    it('should fall back to mock migrations if no other paths exist', async () => {
      const configuredPath = '/configured/path';
      const standardPath = path.join(process.cwd(), 'prisma', 'migrations');
      const parentPath = path.join(process.cwd(), '..', '..', 'prisma', 'migrations');
      const mockPath = path.join(process.cwd(), 'test', 'fixtures', 'migrations');
      
      vi.mocked(getConfig).mockReturnValue({
        migrationsDir: configuredPath,
      });
      
      // Configured path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Standard path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Parent path doesn't exist
      vi.mocked(fs.access).mockRejectedValueOnce(new Error('ENOENT'));
      // Mock path exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath();
      
      expect(result).toBe(mockPath);
      expect(fs.access).toHaveBeenCalledWith(configuredPath);
      expect(fs.access).toHaveBeenCalledWith(standardPath);
      expect(fs.access).toHaveBeenCalledWith(parentPath);
      expect(fs.access).toHaveBeenCalledWith(mockPath);
    });

    it('should handle relative paths in config', async () => {
      const relativePath = 'custom/migrations';
      const fullPath = path.join(process.cwd(), relativePath);
      
      vi.mocked(getConfig).mockReturnValue({
        migrationsDir: relativePath,
      });
      
      // Configured path exists
      vi.mocked(fs.access).mockResolvedValueOnce(undefined);

      const result = await resolveMigrationsPath();
      
      expect(result).toBe(fullPath);
      expect(fs.access).toHaveBeenCalledWith(fullPath);
    });

    it('should throw an error if no migrations directory is found', async () => {
      // All paths don't exist
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      await expect(resolveMigrationsPath()).rejects.toThrow('No migrations directory found');
    });
  });

  describe('getMockMigrationsPath', () => {
    it('should return the path to the mock migrations directory', () => {
      const expectedPath = path.join(process.cwd(), 'test', 'fixtures', 'migrations');
      const result = getMockMigrationsPath();
      
      expect(result).toBe(expectedPath);
    });
  });
}); 