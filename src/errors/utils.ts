/**
 * Type guard to check if an unknown value is an Error object.
 *
 * @param {unknown} e - The value to check
 * @returns {boolean} True if the value is an Error object with valid stack and message properties
 *
 * @example
 * try {
 *   throw new Error('Something went wrong');
 * } catch (e) {
 *   if (isError(e)) {
 *     console.log(e.message); // TypeScript knows e is Error
 *   }
 * }
 *
 * @remarks
 * This function checks for the existence of both `stack` and `message` properties
 * and verifies they are strings, which are standard properties of Error objects.
 * This helps distinguish between actual Error instances and objects that might
 * partially match the Error interface.
 */
export function isError(e: unknown): e is Error {
  const error = e as Record<string, unknown>;
  return error && typeof error.stack === "string" &&
    typeof error.message === "string";
}
