import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import { hashPasswordResetToken } from "../../../lib/password-reset";
import User from "../../../models/User";

export async function POST(request: Request) {
  let token = "";
  let password = "";

  try {
    const body = (await request.json()) as {
      token?: unknown;
      password?: unknown;
    };
    token = typeof body.token === "string" ? body.token.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Reset token is missing." }, { status: 400 });
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters with a letter and number." },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({
    passwordResetTokenHash: hashPasswordResetToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires +passwordHash");

  if (!user) {
    return NextResponse.json(
      { error: "This password reset link is invalid or expired." },
      { status: 400 }
    );
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return NextResponse.json({
    message: "Password updated. You can now sign in with email and password.",
  });
}
