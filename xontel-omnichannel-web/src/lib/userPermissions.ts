const STORAGE_KEY = "userPermissions";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export interface StoredUserPermissions {
  role: string;
  permissions: string[];
}

export const userPermissionsStorage = {
  set(data: StoredUserPermissions): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  get(): StoredUserPermissions | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAdmin(): boolean {
    const role = this.getRole();
    return role !== null && ADMIN_ROLES.has(role);
  },

  // Fail-open: if permissions have never been loaded, allow everything so
  // existing behavior is preserved. Once permissions are stored, enforce them.
  hasPermission(key: string): boolean {
    const stored = this.get();
    if (!stored) return true;
    const { permissions } = stored;
    return permissions.includes("*") || permissions.includes(key);
  },

  getRole(): string | null {
    return this.get()?.role ?? null;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
