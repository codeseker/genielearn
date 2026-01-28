import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { AuthProviders, UserStatus } from "../constants/enums/user";

export interface IUser extends Document {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  status: UserStatus;
  isDeleted: boolean;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  refreshToken?: string | null;
  role?: Types.ObjectId | null;
  avatar?: Types.ObjectId;
  authProvider: AuthProviders;
  authProviderId: string;

  // Custom instance method
  safeUser(): {
    id: string;
    name: string;
    email: string;
    refreshToken?: string | null;
  };

  totalCourses?: number;
  completedCourses?: number;
  pendingCourses?: number;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: false },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
    isDeleted: { type: Boolean, default: false },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    role: { type: Schema.Types.ObjectId, ref: "Role", default: null },
    avatar: { type: Schema.Types.ObjectId, ref: "Upload", default: null },
    authProvider: {
      type: String,
      enum: Object.values(AuthProviders),
      required: true,
    },
    authProviderId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.index({ authProvider: 1, authProviderId: 1, email: 1 }, { unique: true });

UserSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

// Total Courses
UserSchema.virtual("totalCourses", {
  ref: "Course",
  localField: "_id",
  foreignField: "createdBy",
  count: true,
});

UserSchema.virtual("completedCourses", {
  ref: "Course",
  localField: "_id",
  foreignField: "createdBy",
  match: { isCompleted: true },
  count: true,
});

UserSchema.virtual("pendingCourses", {
  ref: "Course",
  localField: "_id",
  foreignField: "createdBy",
  match: { isCompleted: false },
  count: true,
});

UserSchema.methods.safeUser = function () {
  return {
    id: this._id.toString(),
    name: `${this.first_name} ${this.last_name}`,
    email: this.email,
    refreshToken: this.refreshToken || null,
  };
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
