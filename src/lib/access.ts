import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { configuredAdminEmails, isConfiguredAdmin } from "./admin";
import connectDB from "./mongodb";
import User from "../models/User";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  await connectDB();
  return User.findOne({ email: session.user.email.toLowerCase() });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return user;
}

export async function userHasAdminAccess(user: {
  _id: unknown;
  email: string;
  role?: string;
}) {
  if (user.role === "admin" || isConfiguredAdmin(user.email)) {
    return true;
  }

  if (configuredAdminEmails().size > 0) {
    return false;
  }

  const firstUser = await User.findOne().sort({ createdAt: 1, _id: 1 }).select("_id").lean();
  return firstUser?._id.toString() === String(user._id);
}

export async function requireAdmin() {
  const user = await requireCurrentUser();

  if (!(await userHasAdminAccess(user))) {
    redirect("/dashboard");
  }

  return user;
}
