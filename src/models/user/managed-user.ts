// deno-lint-ignore-file no-explicit-any
// ====================== Base User Entity ====================== //

import { Role, type RoleData } from "@models/role.ts";

export interface UserEntityData {
  id: string;
  name: string;
  identity: string;
  profileId: string;
  permissions: string[];
}

/**
 * Base user entity - represents a user in the system
 */
export class UserEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly identity: string; // email or phone
  public readonly profileId: string;
  public readonly permissions: ReadonlySet<string>;

  constructor(data: UserEntityData) {
    this.id = data.id;
    this.name = data.name;
    this.identity = data.identity;
    this.profileId = data.profileId;
    this.permissions = new Set(data.permissions);
  }

  /**
   * Check if user has a specific permission
   */
  can(permission: string): boolean {
    return this.permissions.has(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  canAny(permissions: string[]): boolean {
    return permissions.some((p) => this.permissions.has(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  canAll(permissions: string[]): boolean {
    return permissions.every((p) => this.permissions.has(p));
  }
}

// ====================== Authenticated User (Current Session) ====================== //

export interface AuthenticatedUserData {
  name: string;
  identity: string;
  profileId: string;
  profile: any;
  token: string;
  resetPassword: boolean;
  permissions: string[];
  sessionId?: string;
  expiresAt?: string;
}

// ====================== Managed User (Admin View) ====================== //

export interface ManagedUserData {
  id: string;
  name: string;
  identity: string;
  type: string;
  profileId: string;
  roleId: string;
  resetPassword: boolean;
  isActive: boolean;
  role?: RoleData;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a user from the admin management perspective.
 * Same person as AuthenticatedUser but with management metadata and capabilities.
 */
export class ManagedUser extends UserEntity {
  public readonly type: string;
  public readonly roleId: string;
  public readonly resetPassword: boolean;
  public readonly isActive: boolean;
  public readonly role?: Role;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: ManagedUserData) {
    super({
      id: data.id,
      name: data.name,
      identity: data.identity,
      profileId: data.profileId,
      permissions: data.role?.access ?? [],
    });

    this.type = data.type;
    this.roleId = data.roleId;
    this.resetPassword = data.resetPassword;
    this.isActive = data.isActive;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);

    if (data.role) {
      try {
        this.role = new Role(data.role);
      } catch (_) {
        //
      }
    }
  }

  /**
   * Check if user account is active
   */
  isAccountActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if user needs to reset password
   */
  needsPasswordReset(): boolean {
    return this.resetPassword;
  }

  /**
   * Get comprehensive account status
   */
  getAccountStatus(): {
    status: "active" | "inactive" | "password_reset_required";
    label: string;
    color: "success" | "warning" | "error";
    description: string;
  } {
    if (!this.isActive) {
      return {
        status: "inactive",
        label: "Inactive",
        color: "error",
        description: "Account has been deactivated by an administrator",
      };
    }

    if (this.resetPassword) {
      return {
        status: "password_reset_required",
        label: "Password Reset Required",
        color: "warning",
        description: "User must reset their password on next login",
      };
    }

    return {
      status: "active",
      label: "Active",
      color: "success",
      description: "Account is active and ready to use",
    };
  }

  /**
   * Get role display name
   */
  getRoleName(): string {
    return this.role?.name ?? "";
  }

  /**
   * Get formatted creation date
   */
  getCreatedDate(): string {
    return this.createdAt.toLocaleDateString();
  }

  /**
   * Get time since last update
   */
  getLastUpdateInfo(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.updatedAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return this.updatedAt.toLocaleDateString();
  }

  static from(data: any): ManagedUser | undefined {
    try {
      if (!data?.id || !data?.name || !data?.identity || !data?.roleId) {
        console.error("Missing required ManagedUser fields:", data);
        return undefined;
      }
      return new ManagedUser(data);
    } catch (error) {
      console.error("Error creating ManagedUser:", error);
      return undefined;
    }
  }

  static createMany(dataArray: any[]): ManagedUser[] {
    return dataArray.map((data) => ManagedUser.from(data)).filter(
      Boolean,
    ) as ManagedUser[];
  }

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      identity: this.identity,
      type: this.type,
      profileId: this.profileId,
      roleId: this.roleId,
      resetPassword: this.resetPassword,
      isActive: this.isActive,
      role: this.role?.toJSON(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
