import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { sendVerificationEmail } from "./email";
import User from "../models/User";

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueVerificationEmail(user: {
  _id: unknown;
  email: string;
  name?: string;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const appUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const verificationUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await User.findByIdAndUpdate(user._id, {
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: expires,
  });

  await sendVerificationEmail({
    email: user.email,
    name: user.name ?? "there",
    verificationUrl,
  });
}
