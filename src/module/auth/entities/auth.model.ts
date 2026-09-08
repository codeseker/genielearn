import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AuthProviders,
  AuthStatus,
  UserRoles,
  normalizeEmail,
} from '../auth.constants.js';

/**
 * AUTH collection — authentication state only.
 *
 * Stores identity verification data: email, password hash (if local),
 * auth provider info, roles, status, and token/reset fields.
 *
 * Personal/profile data belongs in the `user_profiles` collection
 * in the users module.
 *
 * Design notes:
 * - `email` is unique and normalized for lookups.
 * - `passwordHash` is conditional: required for LOCAL accounts,
 *   absent for OAuth-only accounts.
 * - `roles` defaults to [USER]; additional roles require updating
 *   authorization logic.
 * - Append-only audit fields like refreshToken are stored here
 *   because they relate to authentication state, not profile.
 */
@Schema({
  timestamps: true,
  collection: 'auths',
})
export class Auth {
  /** MongoDB primary key */
  _id: any;

  /**
   * User's email address.
   * Required, unique (normalized), trimmed.
   */
  @Prop({
    required: true,
    trim: true,
    unique: true,
    set: (v: string) => normalizeEmail(v),
  })
  email: string;

  /**
   * Hashed password.
   * Required for LOCAL auth provider accounts.
   * Not required for OAuth-only accounts.
   * Never stores plaintext passwords.
   */
  @Prop({
    required: false,
    type: String,
    trim: true,
  })
  passwordHash?: string;

  /**
   * Authentication provider that created the account.
   */
  @Prop({
    required: true,
    type: String,
    enum: Object.values(AuthProviders),
    default: AuthProviders.LOCAL,
  })
  authProvider: AuthProviders;

  /**
   * External provider user identifier (e.g. Google sub, GitHub id).
   * Populated for OAuth accounts; empty for local accounts.
   */
  @Prop({
    required: false,
    type: String,
    trim: true,
  })
  authProviderId?: string;

  /**
   * Authorization roles.
   * Must contain only supported application roles.
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'roles',
  })
  role: Types.ObjectId;

  /**
   * Account status.
   */
  @Prop({
    required: true,
    type: String,
    enum: Object.values(AuthStatus),
    default: AuthStatus.ACTIVE,
  })
  status: AuthStatus;

  /**
   * Soft-delete flag.
   * Recommended behavior is controlled account deletion rather than
   * blind cascade deletion of historical learning/audit data.
   */
  @Prop({
    required: false,
    default: false,
  })
  isDeleted: boolean;

  /**
   * Password reset token (transient auth state).
   */
  @Prop({
    required: false,
    type: String,
  })
  passwordResetToken?: string | null;

  /**
   * Password reset token expiration.
   */
  @Prop({
    required: false,
    type: Date,
  })
  passwordResetExpires?: Date | null;

  /**
   * Refresh token for JWT refresh flow (transient auth state).
   */
  @Prop({
    required: false,
    type: String,
  })
  refreshToken?: string | null;
}

export type AuthDocument = HydratedDocument<Auth>;

/**
 * Pre-built Mongoose schema for dependency injection.
 * Exporting the compiled schema avoids accessing .schema on the class
 * at module registration time.
 */
export const AuthSchema = SchemaFactory.createForClass(Auth);
