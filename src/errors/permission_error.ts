import type { Permission } from "../models/permission.ts";

export class PermissionError extends Error {
  constructor(
    public readonly requiredPermissions: Permission[],
    message?: string,
  ) {
    super(
      message ??
        `Missing required permissions: ${requiredPermissions.join(", ")}`,
    );
    this.name = "PermissionError";
  }
}
