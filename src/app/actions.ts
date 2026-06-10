"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "../lib/auth";
import { normalizeCategory } from "../lib/categories";
import { containsProhibitedContent } from "../lib/content-policy";
import { fetchUrlMetadata, normalizeUrl } from "../lib/metadata";
import connectDB from "../lib/mongodb";
import Bookmark from "../models/Bookmark";
import Comment from "../models/Comment";
import User from "../models/User";
import Vote, { type VoteValue } from "../models/Vote";
import SavedBookmark from "../models/SavedBookmark";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
    throw new Error("Invalid item.");
  }
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function requireUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Please sign in to continue.");
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    throw new Error("User account was not found.");
  }

  return user;
}

export async function createBookmark(formData: FormData) {
  const user = await requireUser();
  let title = text(formData, "title");
  const rawUrl = text(formData, "url");
  let description = text(formData, "description");
  let tags = list(formData, "tags");
  const selectedCategory = normalizeCategory(text(formData, "categories"));

  if (!selectedCategory) {
    return {
      ok: false as const,
      error: "Please select a valid category.",
    };
  }

  if (text(formData, "policyAccepted") !== "on") {
    return {
      ok: false as const,
      error: "You must confirm the content policy before submitting.",
    };
  }

  let normalizedUrl = "";
  try {
    normalizedUrl = normalizeUrl(rawUrl);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!title || !description || tags.length === 0) {
    try {
      const metadata = await fetchUrlMetadata(normalizedUrl);
      title ||= metadata.title;
      description ||= metadata.description;
      tags = tags.length > 0 ? tags : metadata.keywords;
    } catch {
      title ||= new URL(normalizedUrl).hostname;
    }
  }

  if (title.length < 3 || title.length > 160) {
    throw new Error("Title must be between 3 and 160 characters.");
  }

  if (containsProhibitedContent([normalizedUrl, title, description, tags.join(" ")])) {
    return {
      ok: false as const,
      error: "This listing appears to violate the content policy.",
    };
  }

  try {
    await Bookmark.create({
      title,
      url: normalizedUrl,
      description,
      tags,
      categories: [selectedCategory.toLowerCase()],
      user: user._id,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return {
        ok: false as const,
        error: "This URL is already in your bookmarks.",
      };
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/top-bookmarks");
  revalidatePath("/dashboard");

  return { ok: true as const };
}

export async function voteBookmark(
  bookmarkId: string,
  value: VoteValue
) {
  validObjectId(bookmarkId);
  const user = await requireUser();
  const existingVote = await Vote.findOne({ bookmark: bookmarkId, user: user._id });

  let scoreDelta: number = value;
  let upvoteDelta = value === 1 ? 1 : 0;
  let downvoteDelta = value === -1 ? 1 : 0;

  if (!existingVote) {
    await Vote.create({ bookmark: bookmarkId, user: user._id, value });
  } else if (existingVote.value === value) {
    scoreDelta = -value;
    upvoteDelta = value === 1 ? -1 : 0;
    downvoteDelta = value === -1 ? -1 : 0;
    await existingVote.deleteOne();
  } else {
    scoreDelta = value - existingVote.value;
    upvoteDelta = value === 1 ? 1 : -1;
    downvoteDelta = value === -1 ? 1 : -1;
    existingVote.value = value;
    await existingVote.save();
  }

  await Bookmark.findByIdAndUpdate(bookmarkId, {
    $inc: {
      score: scoreDelta,
      upvotes: upvoteDelta,
      downvotes: downvoteDelta,
    },
  });

  revalidatePath("/");
  revalidatePath("/top-bookmarks");
}

export async function addComment(bookmarkId: string, formData: FormData) {
  validObjectId(bookmarkId);
  const user = await requireUser();
  const body = text(formData, "body");

  if (body.length < 2 || body.length > 700) {
    throw new Error("Comment must be between 2 and 700 characters.");
  }

  const bookmark = await Bookmark.findById(bookmarkId).select("_id");
  if (!bookmark) {
    throw new Error("Bookmark not found.");
  }

  await Comment.create({ bookmark: bookmarkId, user: user._id, body });
  await Bookmark.findByIdAndUpdate(bookmarkId, { $inc: { commentCount: 1 } });

  revalidatePath("/");
  revalidatePath("/top-bookmarks");
}

export async function toggleSaveBookmark(bookmarkId: string) {
  validObjectId(bookmarkId);
  const user = await requireUser();
  const existingSave = await SavedBookmark.findOne({
    bookmark: bookmarkId,
    user: user._id,
  });

  if (existingSave) {
    await existingSave.deleteOne();
    await Bookmark.findByIdAndUpdate(bookmarkId, { $inc: { savedCount: -1 } });
  } else {
    await SavedBookmark.create({ bookmark: bookmarkId, user: user._id });
    await Bookmark.findByIdAndUpdate(bookmarkId, { $inc: { savedCount: 1 } });
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const name = text(formData, "name");
  const bio = text(formData, "bio");
  const websiteValue = text(formData, "website");

  if (name.length < 2 || name.length > 80) {
    throw new Error("Name must be between 2 and 80 characters.");
  }

  let website = "";
  if (websiteValue) {
    try {
      const parsed = new URL(websiteValue);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
      website = parsed.toString();
    } catch {
      throw new Error("Please enter a valid website URL.");
    }
  }

  await User.findByIdAndUpdate(user._id, { name, bio: bio.slice(0, 280), website });
  revalidatePath("/");
}

export async function deleteBookmark(bookmarkId: string) {
  validObjectId(bookmarkId);
  const user = await requireUser();
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
