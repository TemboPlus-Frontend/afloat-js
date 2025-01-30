import process from "node:process";
export type RuntimeEnvironment = "client" | "server";

export class EnvironmentDetector {
  private static _environment: RuntimeEnvironment | null = null;

  /**
   * Detects the current runtime environment
   * @returns {RuntimeEnvironment}
   * @throws {Error} If environment cannot be definitively determined
   */
  public static detect(): RuntimeEnvironment {
    // If already detected, return cached result
    if (this._environment) {
      return this._environment;
    }

    try {
      // Check for Deno specific global
      if (typeof Deno !== "undefined") {
        this._environment = "server";
        return this._environment;
      }

      // For non-Deno environments, we can use process
      if (
        typeof process !== "undefined" &&
        process.versions?.node &&
        !process.versions?.bun
      ) {
        this._environment = "server";
        return this._environment;
      }

      // For client environments, check window
      // This will throw ReferenceError in Deno
      if (typeof window !== "undefined") {
        this._environment = "client";
        return this._environment;
      }

      throw new Error("Unable to determine runtime environment");
    } catch (error) {
      // If we get a ReferenceError for 'window' in Deno, we're in server
      if (error instanceof ReferenceError) {
        this._environment = "server";
        return this._environment;
      }
      throw error;
    }
  }

  /**
   * Checks if code is running in client environment
   */
  public static isClient(): boolean {
    return this.detect() === "client";
  }

  /**
   * Checks if code is running in server environment
   */
  public static isServer(): boolean {
    return this.detect() === "server";
  }

  /**
   * Explicitly sets the environment (useful for testing)
   * @param {RuntimeEnvironment} env
   */
  public static setEnvironment(env: RuntimeEnvironment): void {
    this._environment = env;
  }

  /**
   * Resets the detected environment (useful for testing)
   */
  public static reset(): void {
    this._environment = null;
  }
}
