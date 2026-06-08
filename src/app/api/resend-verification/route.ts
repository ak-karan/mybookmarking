import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import { issueVerificationEmail } from "../../../lib/verification";
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

  if (user && !user.emailVerified && user.authProvider === "credentials") {
    try {
      await issueVerificationEmail(user);
    } catch (error) {
      console.error("Could not resend verification email:", error);
      return NextResponse.json(
        { error: "Verification email could not be sent." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({
    message: "If an unverified account exists, a verification email has been sent.",
  });
}
