import { BaseRepository } from "@shared/base_repository.ts";
import { userManagementContract } from "./contract.ts";
import type {
  CreateUserRequest,
  CreateUserResponse,
  ResetPasswordRequest,
  UpdateUserRequest,
} from "@features/admin/schemas.ts";
import type { AfloatAuth } from "@features/auth/manager.ts";
import {
  ManagedUser,
  type ManagedUserData,
  Permissions,
} from "@models/index.ts";
import { PermissionError } from "@errors/index.ts";
import { Role, type RoleData } from "@models/role.ts";

/**
 * Repository class for managing user accounts through API interactions.
 * Extends the `BaseRepository` to leverage shared functionality.
 */
export class UserManagementRepository
  extends BaseRepository<typeof userManagementContract> {
  /**
   * Creates an instance of `UserManagementRepository` using the user management contract.
   * @param {Object} [props] - Optional constructor properties
   * @param {AfloatAuth} [props.auth] - Optional auth instance to use
   * @param {string} [props.root] - Optional API root URL
   */
  constructor(props?: { auth?: AfloatAuth; root?: string }) {
    super("admin", userManagementContract, props);
  }

  /**
   * Creates a new user account.
   * @param {CreateUserRequest} input - The data required to create a new user account.
   * @returns {Promise<CreateUserResponse>} A promise that resolves to the newly created user response.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 201.
   */
  async createUser(input: CreateUserRequest): Promise<CreateUserResponse> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.CreateUser;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to create user accounts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.createUser({ body: input });
    const data = this.handleResponse<CreateUserResponse>(result, 201);
    return data;
  }

  /**
   * Updates an existing user account by ID.
   * @param {string} id - The unique identifier of the user account to update.
   * @param {UpdateUserRequest} input - The data to update the user account with.
   * @returns {Promise<ManagedUser>} A promise that resolves to the updated user account.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async updateUser(id: string, input: UpdateUserRequest): Promise<ManagedUser> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.UpdateUser;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to update user accounts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.updateUser({
      params: { id },
      body: input,
    });
    const data = this.handleResponse<ManagedUserData>(result, 200);
    const managedUser = ManagedUser.from(data);
    if (!managedUser) {
      throw new Error("Invalid user data received from server");
    }
    return managedUser;
  }

  /**
   * Archives (soft deletes) a user account by ID.
   * @param {string} id - The unique identifier of the user account to archive.
   * @returns {Promise<{ isArchived: boolean }>} A promise that resolves to whether isArchived.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async archiveUser(id: string): Promise<{ isArchived: boolean }> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.ArchiveUser;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to archive user accounts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.archiveUser({ params: { id } });
    return this.handleResponse<{ isArchived: boolean }>(result, 200);
  }

  /**
   * Archives (soft deletes) a user account by ID.
   * @param {string} id - The unique identifier of the user account to archive.
   * @returns {Promise<{ isArchived: boolean }>} A promise that resolves to whether isArchived.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async unArchiveUser(id: string): Promise<{ isArchived: boolean }> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.ArchiveUser;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to un-archive user accounts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.unarchiveUser({ params: { id } });
    return this.handleResponse<{ isArchived: boolean }>(result, 200);
  }

  /**
   * Resets a user's password.
   * @param {string} id - The unique identifier of the user account.
   * @param {ResetPasswordRequest} [input] - Optional password reset configuration.
   * @returns {Promise<void>} A promise that resolves when the password reset is complete.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   */
  async resetUserPassword(
    id: string,
    input: ResetPasswordRequest = {},
  ): Promise<{ success: boolean }> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.ResetPassword;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to reset user passwords.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.resetPassword({
      params: { id },
      body: input,
    });
    return this.handleResponse<{ success: boolean }>(result, 200);
  }

  /**
   * Retrieves all user accounts.
   * Results are ordered in descending order by creation date by default.
   *
   * @returns {Promise<ManagedUser[]>} A promise that resolves to an array of managed users.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   * @example
   * const repository = new UserManagementRepository();
   * repository.getAllUsers().then(users => console.log(users));
   */
  async getAllUsers(): Promise<ManagedUser[]> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.ViewUsers;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view user accounts.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.getUsers({ query: { eager: "role" } });
    const data = this.handleResponse<ManagedUserData[]>(result, 200);
    return ManagedUser.createMany(data);
  }

  /**
   * Retrieves a specific user account by ID.
   *
   * @param {string} id - The unique identifier of the user account to retrieve.
   * @returns {Promise<ManagedUser>} A promise that resolves to the managed user.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200 or user not found.
   * @example
   * const repository = new UserManagementRepository();
   * repository.getUser('user-id').then(user => console.log(user));
   */
  async getUser(id: string): Promise<ManagedUser> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.UserManagement.ViewUser;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view user account details.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.getUser({
      params: { id },
      query: { eager: "role" },
    });
    const data = this.handleResponse<ManagedUserData>(result, 200);
    const managedUser = ManagedUser.from(data);
    if (!managedUser) {
      throw new Error("Invalid user data received from server");
    }
    return managedUser;
  }

  /**
   * Retrieves all available roles in the system.
   *
   * @returns {Promise<Role[]>} A promise that resolves to an array of roles.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200.
   * @example
   * const repository = new UserManagementRepository();
   * repository.getAllRoles().then(roles => console.log(roles));
   */
  async getAllRoles(): Promise<Role[]> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Role.ViewRoles;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view system roles.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.getRoles();
    const data = this.handleResponse<RoleData[]>(result, 200);
    return data.map((roleData) => {
      const role = Role.from(roleData);
      if (!role) {
        throw new Error("Invalid role data received from server");
      }
      return role;
    });
  }

  /**
   * Retrieves a specific role by ID.
   *
   * @param {string} id - The unique identifier of the role to retrieve.
   * @returns {Promise<Role>} A promise that resolves to the role.
   * @throws {PermissionError} If the user lacks required permissions
   * @throws {APIError} If the response status code is not 200 or role not found.
   * @example
   * const repository = new UserManagementRepository();
   * repository.getRole('role-id').then(role => console.log(role));
   */
  async getRole(id: string): Promise<Role> {
    const auth = this.getAuthForPermissionCheck();
    const requiredPerm = Permissions.Role.ViewRoles;

    if (!auth.checkPermission(requiredPerm)) {
      throw new PermissionError({
        message: "You are not authorized to view role details.",
        requiredPermissions: [requiredPerm],
      });
    }

    const result = await this.client.getRole({ params: { id } });
    const data = this.handleResponse<RoleData>(result, 200);
    const role = Role.from(data);
    if (!role) {
      throw new Error("Invalid role data received from server");
    }
    return role;
  }
}
