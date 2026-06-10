import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "./email";
import User from "../models/User";

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordResetEmail(user: {
  _id: unknown;
  email: string;
  name?: string;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  const appUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await User.findByIdAndUpdate(user._id, {
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: expires,
  });

  try {
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name ?? "there",
      resetUrl,
    });
  } catch (error) {
    await User.findByIdAndUpdate(user._id, {
      $unset: {
        passwordResetTokenHash: 1,
        passwordResetExpires: 1,
      },
    });
    throw error;
  }
}
