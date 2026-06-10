import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import { issuePasswordResetEmail } from "../../../lib/password-reset";
import User from "../../../models/User";

export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email });

  if (user) {
    try {
      await issuePasswordResetEmail(user);
    } catch (error) {
      console.error("Could not send password reset email:", error);
      return NextResponse.json(
        { error: "Password reset email could not be sent. Please contact support." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({
    message: "If an account exists for this email, a password reset link has been sent.",
  });
}
