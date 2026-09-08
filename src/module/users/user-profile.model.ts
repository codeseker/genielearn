import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";

/**
 * USER_PROFILE collection — personal/identity details.
 *
 * Stores user-facing profile data that is separate from authentication
 * credentials. The profile is linked to an Auth document via userId.
 *
 * Design notes:
 * - One profile per auth account (1:1 relationship).
 * - Profile can exist independently of auth mechanism details.
 * - OAuth users get a profile even if they have no passwordHash.
 * - Avatar is a reference (URL/path), not embedded binary data.
 */
@Schema({
  timestamps: true,
  collection: "user_profiles",
})
export class UserProfile {
  /** MongoDB primary key */
  _id: Types.ObjectId;

  /**
   * Reference to the Auth document that owns this profile.
   * Required, unique (one profile per auth account).
   */
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "Auth",
    unique: true,
  })
  userId: Types.ObjectId;

  /**
   * User display name.
   * Required, trimmed.
   */
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  /**
   * First name (optional, for personalization).
   */
  @Prop({
    required: false,
    trim: true,
  })
  firstName?: string;

  /**
   * Last name (optional, for personalization).
   */
  @Prop({
    required: false,
    trim: true,
  })
  lastName?: string;

  /**
   * User avatar/profile image reference (URL or path).
   * Optional; null when not set.
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  avatar: string | null;

  /**
   * Brief bio or description (optional).
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  bio: string | null;

  /**
   * Location (optional, for display purposes).
   */
  @Prop({
    required: false,
    default: null,
    trim: true,
  })
  location: string | null;

  /**
   * Profile completion status.
   * Useful for prompting users to complete their profile.
   */
  @Prop({
    required: false,
    default: false,
  })
  isProfileComplete: boolean;

  /**
   * Additional bounded profile metadata.
   * Must not be used as an unstructured replacement for core fields.
   */
  @Prop({
    required: false,
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;
}

export type UserProfileDocument = HydratedDocument<UserProfile>;

/**
 * Pre-built Mongoose schema for dependency injection.
 */
export const UserProfileSchema = SchemaFactory.createForClass(UserProfile)
