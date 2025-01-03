import { BaseRepository } from "@shared/index.ts";
import { contract } from "@features/payout/contract.ts";
import {
  type GetPayoutsArgs,
  PAYOUT_APPROVAL_STATUS,
  type PayoutInput,
} from "@models/payout/index.ts";
import { AfloatAuth } from "@features/auth/manager.ts";
import { Permissions } from "@models/permission.ts";
import { APIError, PermissionError } from "@errors/index.ts";
import { Payout } from "@models/payout/derivatives/payout.ts";

export class PayoutRepository extends BaseRepository<typeof contract> {
  /**
   * Creates an instance of `PayoutRepository` using the contact contract.
   */
  constructor() {
    super("payout", contract);
  }

  async getAll(args?: GetPayoutsArgs): Promise<{
    results: Payout[];
    total: number;
  }> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Payout.List)) {
      throw new PermissionError({
        message: "You are not authorized to view payouts.",
        requiredPermissions: [Permissions.Payout.List],
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

  async pay(input: PayoutInput): Promise<Payout> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Payout.Create)) {
      throw new PermissionError({
        message: "You are not authorized to create payouts.",
        requiredPermissions: [Permissions.Payout.Create],
      });
    }

    const result = await this.client.postPayout({ body: input });
    if (result.status === 201) return Payout.create(result.body);
    if (result.status === 400) {
      throw new APIError(result.body);
    }

    throw APIError.unknown();
  }

  async approve(id: string, args?: { notes?: string }): Promise<Payout> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Payout.Approve)) {
      throw new PermissionError({
        message: "You are not authorized to approve or reject payouts.",
        requiredPermissions: [Permissions.Payout.Approve],
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

  async reject(id: string, args?: { notes?: string }): Promise<Payout> {
    if (!AfloatAuth.instance.checkPermission(Permissions.Payout.Approve)) {
      throw new PermissionError({
        message: "You are not authorized to approve or reject payouts.",
        requiredPermissions: [Permissions.Payout.Approve],
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
