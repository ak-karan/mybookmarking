import mongoose, { Document, Model } from "mongoose";

export type UserRole = "user" | "admin";
export type AuthProvider = "credentials" | "google";

export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  bio?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  birthDate?: Date;
  passwordHash?: string;
  emailVerified?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  authProvider: AuthProvider;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    bio: { type: String, maxlength: 280 },
    website: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    birthDate: { type: Date },
    passwordHash: { type: String, select: false },
    emailVerified: { type: Date },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "google",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
