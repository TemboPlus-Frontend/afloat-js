/**
 * Arguments for retrieving payouts from the API.
 *
 * @interface GetPayoutsAPIArgs
 *
 * @property {number} [rangeStart] - The starting index for pagination. If not provided, defaults to beginning.
 * @property {number} [rangeEnd] - The ending index for pagination. If not provided, defaults to 10.
 * @property {boolean} [pending] - Filter for pending payouts only. If true, returns only pending payouts.
 *
 * @example
 * ```ts
 * // Get first 10 payouts
 * const args: GetPayoutsAPIArgs = {
 *   rangeStart: 0,
 *   rangeEnd: 10
 * };
 *
 * // Get only pending payouts
 * const pendingArgs: GetPayoutsAPIArgs = {
 *   pending: true
 * };
 * ```
 */
export interface GetPayoutsAPIArgs {
  rangeStart?: number;
  rangeEnd?: number;
  pending?: boolean;
}
