export enum AuthStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum AuthProviders {
  GOOGLE = "google",
  GITHUB = "github",
  LOCAL = "local",
}

export enum UserRoles {
  USER = "USER",
  ADMIN = "ADMIN",
}

/**
 * Normalized email comparison helper.
 * MongoDB unique indexes are case-sensitive by default,
 * so we store a normalized form for lookups.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}