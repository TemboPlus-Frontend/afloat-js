// deno-lint-ignore-file no-explicit-any
// ====================== Role Entity ====================== //

export interface RoleData {
  id: string;
  name: string;
  description?: string;
  access: string[];
  createdAt: string;
  updatedAt: string;
}

export class Role {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly permissions: ReadonlySet<string>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: RoleData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.permissions = new Set(data.access);
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }

  static from(data: any): Role | undefined {
    try {
      if (!data?.id || !data?.name || !Array.isArray(data?.access)) {
        return undefined;
      }
      return new Role(data);
    } catch (error) {
      console.error("Error creating Role:", error);
      return undefined;
    }
  }

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      access: Array.from(this.permissions),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
