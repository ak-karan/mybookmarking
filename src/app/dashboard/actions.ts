"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { requireCurrentUser } from "../../lib/access";
import { normalizeUrl } from "../../lib/metadata";
import Bookmark from "../../models/Bookmark";
import Comment from "../../models/Comment";
import SavedBookmark from "../../models/SavedBookmark";
import User from "../../models/User";
import Vote from "../../models/Vote";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseBirthDate(value: string) {
  if (!value) {
    return undefined;
  }

  const birthDate = new Date(`${value}T00:00:00.000Z`);
  const today = new Date();
  const oldestAllowed = new Date();
  oldestAllowed.setFullYear(today.getFullYear() - 120);

  if (Number.isNaN(birthDate.getTime()) || birthDate > today || birthDate < oldestAllowed) {
    throw new Error("Please enter a valid date of birth.");
  }

  return birthDate;
}

function parseOptionalUrl(value: string, label: string) {
  if (!value) {
    return "";
  }

  try {
    return normalizeUrl(value);
  } catch {
    throw new Error(`Please enter a valid ${label} URL.`);
  }
}

function list(formData: FormData, key: string) {
  return [...new Set(
    text(formData, key)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )].slice(0, 8);
}

function validObjectId(value: string) {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error("Invalid bookmark.");
  }
}

export async function updateDashboardProfile(formData: FormData) {
  const user = await requireCurrentUser();
  const name = text(formData, "name");
  const websiteValue = text(formData, "website");
  const bio = text(formData, "bio");
  const birthDate = parseBirthDate(text(formData, "birthDate"));

  if (name.length < 2 || name.length > 80) {
    throw new Error("Name must be between 2 and 80 characters.");
  }

  const website = parseOptionalUrl(websiteValue, "website");
  const facebook = parseOptionalUrl(text(formData, "facebook"), "Facebook");
  const instagram = parseOptionalUrl(text(formData, "instagram"), "Instagram");
  const linkedin = parseOptionalUrl(text(formData, "linkedin"), "LinkedIn");
  const twitter = parseOptionalUrl(text(formData, "twitter"), "Twitter/X");

  await User.findByIdAndUpdate(user._id, {
    name,
    website,
    facebook,
    instagram,
    linkedin,
    twitter,
    bio: bio.slice(0, 280),
    ...(birthDate ? { birthDate } : {}),
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?updated=profile");
}

export async function changePassword(formData: FormData) {
  const sessionUser = await requireCurrentUser();
  const user = await User.findById(sessionUser._id).select("+passwordHash");
  const currentPassword = text(formData, "currentPassword");
  const newPassword = text(formData, "newPassword");
  const confirmPassword = text(formData, "confirmPassword");

  if (!user) {
    throw new Error("User not found.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match.");
  }

  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw new Error("New password must be at least 8 characters with a letter and number.");
  }

  if (user.passwordHash) {
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!validCurrentPassword) {
      throw new Error("Current password is incorrect.");
    }
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  revalidatePath("/dashboard");
  redirect("/dashboard?updated=password");
}

export async function updateUserBookmark(bookmarkId: string, formData: FormData) {
  validObjectId(bookmarkId);
  const user = await requireCurrentUser();
  const title = text(formData, "title");
  const description = text(formData, "description");
  const url = normalizeUrl(text(formData, "url"));

  if (title.length < 3 || title.length > 160) {
    throw new Error("Title must be between 3 and 160 characters.");
  }

  await Bookmark.findOneAndUpdate(
    { _id: bookmarkId, user: user._id },
    {
      title,
      url,
      description: description.slice(0, 500),
      tags: list(formData, "tags"),
      categories: list(formData, "categories"),
    }
  );

  revalidatePath("/");
  revalidatePath("/top-bookmarks");
  revalidatePath("/dashboard");
  redirect("/dashboard?updated=bookmark");
}

export async function deleteUserBookmark(bookmarkId: string) {
  validObjectId(bookmarkId);
  const user = await requireCurrentUser();
  const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, user: user._id });

  if (!bookmark) {
    throw new Error("Bookmark not found or you do not own it.");
  }

  await Promise.all([
    Vote.deleteMany({ bookmark: bookmarkId }),
    Comment.deleteMany({ bookmark: bookmarkId }),
    SavedBookmark.deleteMany({ bookmark: bookmarkId }),
  ]);

  revalidatePath("/");
  revalidatePath("/top-bookmarks");
  revalidatePath("/dashboard");
}
