import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserManagementSchemas } from "@features/admin/schemas.ts";

// ====================== API Contract ====================== //
const c = initContract();

export const userManagementContract = c.router({
  // List all users
  getUsers: {
    method: "GET",
    path: "/login",
    responses: {
      200: z.array(UserManagementSchemas.managedUser),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
    },
    summary: "List all user accounts",
    description: "Retrieve a list of all user accounts in the system",
  },

  // Get user by ID
  getUser: {
    method: "GET",
    path: "/login/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: UserManagementSchemas.managedUser,
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Get user account details",
    description: "Retrieve detailed information about a specific user account",
  },

  // Create new user
  createUser: {
    method: "POST",
    path: "/login",
    body: UserManagementSchemas.createUserRequest,
    responses: {
      201: UserManagementSchemas.createUserResponse,
      400: z.object({
        message: z.string(),
        errors: z.array(z.string()).optional(),
      }),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      409: z.object({
        message: z.string(),
      }),
    },
    summary: "Create new user account",
    description:
      "Create a new user account with specified role and permissions",
  },

  // Update user
  updateUser: {
    method: "PATCH",
    path: "/login/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: UserManagementSchemas.updateUserRequest,
    responses: {
      200: UserManagementSchemas.managedUser,
      400: z.object({
        message: z.string(),
        errors: z.array(z.string()).optional(),
      }),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Update user account",
    description:
      "Update user account information, role, status, or force password reset",
  },

  // Archive user (soft delete)
  archiveUser: {
    method: "DELETE",
    path: "/login/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: UserManagementSchemas.managedUser,
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Archive user account",
    description: "Archive (soft delete) a user account",
  },

  // Reset user password
  resetPassword: {
    method: "POST",
    path: "/login/:id/reset-password",
    pathParams: z.object({
      id: z.string(),
    }),
    body: UserManagementSchemas.resetPasswordRequest,
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({
        message: z.string(),
      }),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Reset user password",
    description: "Reset a user's password and optionally send notification",
  },

  // Get all roles
  getRoles: {
    method: "GET",
    path: "/role",
    responses: {
      200: z.array(UserManagementSchemas.role),
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
    },
    summary: "List all roles",
    description: "Retrieve a list of all available roles in the system",
  },

  // Get role by ID
  getRole: {
    method: "GET",
    path: "/role/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: UserManagementSchemas.role,
      401: z.object({
        message: z.string(),
      }),
      403: z.object({
        message: z.string(),
      }),
      404: z.object({
        message: z.string(),
      }),
    },
    summary: "Get role details",
    description: "Retrieve detailed information about a specific role",
  },
});

/**
 * TypeScript type for the complete user management contract.
 * Use this type for strongly typed API client implementations.
 */
export type UserManagementContract = typeof userManagementContract;
