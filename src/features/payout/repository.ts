import { BaseRepository } from "@shared/index.ts";
import { contract, type PayoutAPI } from "@features/payout/contract.ts";
import {
  type GetPayoutsAPIArgs,
  PAYOUT_APPROVAL_STATUS,
  type PayoutInput,
} from "@models/payout/index.ts";
import { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/permission.ts";
import { APIError, PermissionError } from "@errors/index.ts";
import { Payout } from "@models/payout/derivatives/payout.ts";

/**
 * Repository class for managing payout operations including creation, approval,
 * rejection, and retrieval of payouts.
 * @extends {BaseRepository<PayoutAPI>}
 */
export class PayoutRepository extends BaseRepository<PayoutAPI> {
  /**
   * Creates an instance of PayoutRepository initialized with the payout contract.
   */
  constructor() {
    super("payout", contract);
  }

  /**
   * Retrieves a paginated list of payouts with optional filtering for pending status.
   * @param {GetPayoutsAPIArgs} [args] - Optional arguments for filtering and pagination
   * @param {number} [args.rangeStart=0] - Starting index for pagination
   * @param {number} [args.rangeEnd=10] - Ending index for pagination
   * @param {boolean} [args.pending] - Filter for pending payouts only
   * @throws {PermissionError} If user lacks the Payout.List permission
   * @throws {APIError} If range is invalid or if the fetch operation fails
   * @returns {Promise<{results: Payout[]; total: number}>} Paginated payout results and total count
   */
  async getAll(args?: GetPayoutsAPIArgs): Promise<{
    results: Payout[];
    total: number;
  }> {
    const requiredPerm = Permissions.Payout.List;
    if (!AfloatAuth.instance.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view payouts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const rangeStart = args?.rangeStart ?? 0;
    const rangeEnd = args?.rangeEnd ?? 10;
    const pendingStatus = PAYOUT_APPROVAL_STATUS.PENDING;

    const query = {
      rangeStart,
      rangeEnd,
      eager: "[createdBy,actionedBy]",
      orderByDesc: "createdAt",
    };

    if (args?.pending) {
      Object.assign(query, { approvalStatus: pendingStatus });
    }

    if (rangeEnd <= rangeStart) {
      throw new APIError({
        message: "Invalid range: end-date must be greater than start-date",
        statusCode: 400,
      });
    }

    const result = await this.client.getPayouts({ query: query });

    if (result.status === 200) {
      return {
        results: Payout.createMany(result.body.results),
        total: result.body.total,
      };
    }

    throw APIError.unknown("An error occured while fetching payouts");
  }

  /**
   * Creates a new payout with the provided input data.
   * @param {PayoutInput} input - The payout creation data
   * @throws {PermissionError} If user lacks the Payout.Create permission
   * @throws {APIError} If the input is invalid or if the creation operation fails
   * @returns {Promise<Payout>} The created payout
   */
  async pay(input: PayoutInput): Promise<Payout> {
    const requiredPerm = Permissions.Payout.Create;
    if (!AfloatAuth.instance.checkPermission(Permissions.Payout.Create)) {
      throw new PermissionError({
        message: "You are not authorized to create payouts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.postPayout({ body: input });
    if (result.status === 201) return Payout.create(result.body);
    if (result.status === 400) {
      throw new APIError(result.body);
    }

    throw APIError.unknown();
  }

  /**
   * Approves a payout with optional notes.
   * @param {string} id - The ID of the payout to approve
   * @param {Object} [args] - Optional arguments
   * @param {string} [args.notes] - Optional notes for the approval
   * @throws {PermissionError} If user lacks the Payout.Approve permission
   * @throws {APIError} If payout is not found, already approved, or if the operation fails
   * @returns {Promise<Payout>} The approved payout
   */
  async approve(id: string, args?: { notes?: string }): Promise<Payout> {
    const requiredPerm = Permissions.Payout.Approve;
    if (!AfloatAuth.instance.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to approve or reject payouts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.approve({
      params: { id },
      body: { action: "Approve", notes: args?.notes },
    });

    if (result.status === 201) {
      return Payout.create(result.body);
    }
    if (result.status === 404) {
      throw new APIError({ message: "Payout not found", statusCode: 404 });
    }
    if (result.status === 409) {
      throw new APIError({
        message: "Payout already approved",
        statusCode: 409,
      });
    }

    throw APIError.unknown();
  }

  /**
   * Rejects a payout with optional notes.
   * @param {string} id - The ID of the payout to reject
   * @param {Object} [args] - Optional arguments
   * @param {string} [args.notes] - Optional notes for the rejection
   * @throws {PermissionError} If user lacks the Payout.Approve permission
   * @throws {APIError} If payout is not found, already rejected, or if the operation fails
   * @returns {Promise<Payout>} The rejected payout
   */
  async reject(id: string, args?: { notes?: string }): Promise<Payout> {
    const requiredPerm = Permissions.Payout.Approve;
    if (!AfloatAuth.instance.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to approve or reject payouts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.approve({
      params: { id },
      body: { action: "Reject", notes: args?.notes },
    });

    if (result.status === 201) {
      return Payout.create(result.body);
    }
    if (result.status === 404) {
      throw new APIError({ message: "Payout not found", statusCode: 404 });
    }
    if (result.status === 409) {
      throw new APIError({
        message: "Payout already rejected",
        statusCode: 409,
      });
    }

    throw APIError.unknown();
  }
}
