import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

class EnvironmentLoader {
  private static instance: EnvironmentLoader;
  private envLoaded = false;

  private constructor() {}

  static getInstance(): EnvironmentLoader {
    if (!EnvironmentLoader.instance) {
      EnvironmentLoader.instance = new EnvironmentLoader();
    }
    return EnvironmentLoader.instance;
  }

  /**
   * Load environment variables from SOPS encrypted file or .env file
   */
  load(options: { decrypt?: boolean; envFile?: string } = {}): void {
    if (this.envLoaded) {
      return;
    }

    const { decrypt = true, envFile } = options;
    const envPath = this.resolveEnvPath(envFile);

    if (!existsSync(envPath)) {
      console.warn(`Environment file not found: ${envPath}`);
      return;
    }

    try {
      const envContent = this.loadEnvContent(envPath, decrypt);
      this.parseAndSetEnvVars(envContent);
      this.envLoaded = true;
      console.log(`Environment loaded from: ${envPath}`);
    } catch (error) {
      console.error(`Failed to load environment: ${error}`);
      throw error;
    }
  }

  private resolveEnvPath(envFile?: string): string {
    const env = process.env.NODE_ENV ?? 'development';
    const filename = envFile ?? `.env.${env}`;

    // Check for encrypted version first
    const encryptedPath = resolve(process.cwd(), `${filename}.encrypted`);
    if (existsSync(encryptedPath)) {
      return encryptedPath;
    }

    // Fall back to plaintext version
    return resolve(process.cwd(), filename);
  }

  private loadEnvContent(envPath: string, decrypt: boolean): string {
    if (envPath.endsWith('.encrypted') && decrypt) {
      return this.decryptWithSops(envPath);
    }
    return readFileSync(envPath, 'utf-8');
  }

  private decryptWithSops(filePath: string): string {
    try {
      // Verify SOPS is installed
      execSync('sops --version', { stdio: 'ignore' });

      // Decrypt the file
      const result = execSync(`sops decrypt "${filePath}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      return result;
    } catch (error) {
      throw new Error(
        `SOPS decryption failed. Ensure SOPS is installed and age keys are configured.\n` +
          `Error: ${error}`
      );
    }
  }

  private parseAndSetEnvVars(content: string): void {
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse KEY=VALUE format
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Only set if not already defined (allows env var overrides)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  /**
   * Get a required environment variable
   */
  getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable not set: ${key}`);
    }
    return value;
  }

  /**
   * Get an optional environment variable with default
   */
  getOptional(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
  }
}

// Export singleton instance
export const env = EnvironmentLoader.getInstance();

// Convenience functions
export const getRequiredEnv = (key: string): string => env.getRequired(key);
export const getOptionalEnv = (key: string, defaultValue: string): string =>
  env.getOptional(key, defaultValue);
