// import { Permissions } from "../permission.ts";
// import type { CoreUser, Profile } from "./types.ts";

// const P = Permissions;

// export class User {
//   public profile: Profile;
//   public token: string;
//   public resetPassword: boolean;

//   private permissionsMap: Record<string, boolean>;

//   constructor(userData: CoreUser) {
//     const { profile, token, access, resetPassword } = userData;

//     this.profile = profile;
//     this.token = token;
//     this.resetPassword = resetPassword;

//     this.permissionsMap = {
//       [P.Payout.Approve]: access.includes(P.Payout.Approve),
//       [P.Payout.Create]: access.includes(P.Payout.Create),
//       [P.Payout.List]: access.includes(P.Payout.List),
//       [P.Contact.Create]: access.includes(P.Contact.Create),
//       [P.Contact.Update]: access.includes(P.Contact.Update),
//       [P.Contact.Delete]: access.includes(P.Contact.Delete),
//       [P.Contact.List]: access.includes(P.Contact.List),
//       [P.Wallet.ViewBalance]: access.includes(P.Wallet.ViewBalance),
//       [P.Wallet.ViewStatement]: access.includes(P.Wallet.ViewStatement),
//     };
//   }

//   // Dynamically checking permissions
//   public can(permission: string): boolean {
//     return this.permissionsMap[permission] ?? false;
//   }
// }
import { Permissions } from "../permission.ts";
import type { CoreUser, Profile } from "./types.ts";

export class User {
  public profile: Profile;
  public token: string;
  public resetPassword: boolean;

  private permissionsMap: Record<string, boolean>;

  constructor(userData: CoreUser) {
    const { profile, token, access, resetPassword } = userData;

    this.profile = profile;
    this.token = token;
    this.resetPassword = resetPassword;

    // Initialize permissions map
    this.permissionsMap = {};
    for (const permission of Object.values(Permissions)) {
      if (typeof permission === "object") {
        Object.values(permission).forEach((perm) => {
          this.permissionsMap[perm] = access.includes(perm);
        });
      }
    }
  }

  // Dynamically checking permissions
  public can(permission: string): boolean {
    return this.permissionsMap[permission] ?? false;
  }

  // Convert class instance to JSON
  public toJSON(): string {
    return JSON.stringify({
      profile: this.profile,
      token: this.token,
      resetPassword: this.resetPassword,
      permissions: Object.keys(this.permissionsMap).filter(
        (key) => this.permissionsMap[key],
      ),
    });
  }

  // Construct a User instance from JSON
  public static fromJSON(jsonString: string): User {
    const data = JSON.parse(jsonString);

    if (
      !data.profile ||
      !data.token ||
      !Array.isArray(data.permissions) ||
      typeof data.resetPassword !== "boolean"
    ) {
      throw new Error("Invalid JSON data for User");
    }

    // Reconstruct the CoreUser structure
    const coreUser: CoreUser = {
      profile: data.profile,
      token: data.token,
      access: data.permissions,
      resetPassword: data.resetPassword,
    };

    return new User(coreUser);
  }
}
