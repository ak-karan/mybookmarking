import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { isConfiguredAdmin } from "../../../lib/admin";
import connectDB from "../../../lib/mongodb";
import { issueVerificationEmail } from "../../../lib/verification";
import User from "../../../models/User";

type RegistrationBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  birthDate?: unknown;
};

function value(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

export async function POST(request: Request) {
  let body: RegistrationBody;

  try {
    body = (await request.json()) as RegistrationBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = value(body.name);
  const email = value(body.email).toLowerCase();
  const password = value(body.password);
  const birthDateValue = value(body.birthDate);
  const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "Name must be between 2 and 80 characters." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters with a letter and number." },
      { status: 400 }
    );
  }

  const birthDate = new Date(`${birthDateValue}T00:00:00.000Z`);
  const today = new Date();
  const oldestAllowed = new Date();
  oldestAllowed.setFullYear(today.getFullYear() - 120);

  if (
    !birthDateValue ||
    Number.isNaN(birthDate.getTime()) ||
    birthDate > today ||
    birthDate < oldestAllowed
  ) {
    return NextResponse.json(
      { error: "Please enter a valid date of birth." },
      { status: 400 }
    );
  }

  if (requireEmailVerification && !process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email verification service is not configured yet." },
      { status: 503 }
    );
  }

  await connectDB();
  const existingUser = await User.findOne({ email }).select("_id authProvider emailVerified");

  if (existingUser) {
    if (
      existingUser.authProvider === "credentials" &&
      !existingUser.emailVerified &&
      !requireEmailVerification
    ) {
      existingUser.name = name;
      existingUser.birthDate = birthDate;
      existingUser.passwordHash = await bcrypt.hash(password, 12);
      existingUser.emailVerified = new Date();
      await existingUser.save();

      return NextResponse.json(
        { message: "Account activated. You can sign in now.", requiresVerification: false },
        { status: 200 }
      );
    }

    const message =
      existingUser.authProvider === "google"
        ? "This email already uses Google sign-in. Sign in with Google, then create a MyBookmark password from your dashboard."
        : "An account with this email already exists.";

    return NextResponse.json({ error: message }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    birthDate,
    authProvider: "credentials",
    emailVerified: requireEmailVerification ? undefined : new Date(),
    role: isConfiguredAdmin(email) ? "admin" : "user",
  });

  if (requireEmailVerification) {
    try {
      await issueVerificationEmail(user);
    } catch (error) {
      console.error("Could not send verification email:", error);
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        {
          error:
            "Verification email could not be sent. No account was created, so you can try again.",
        },
        { status: 503 }
      );
    }
  }

  return NextResponse.json(
    {
      message: requireEmailVerification
        ? "Account created. Check your email to verify your account."
        : "Account created. You can sign in now.",
      requiresVerification: requireEmailVerification,
    },
    { status: 201 }
  );
}
