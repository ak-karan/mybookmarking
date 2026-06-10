import type { MetadataRoute } from "next";
import connectDB from "../lib/mongodb";
import { siteUrl } from "../lib/seo";
import User from "../models/User";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  let memberPages: MetadataRoute.Sitemap = [];

  try {
    await connectDB();
    const users = await User.find({})
      .select("_id updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();

    memberPages = users.map((user) => ({
      url: `${siteUrl}/users/${user._id.toString()}`,
      lastModified: user.updatedAt ?? lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Could not add member pages to sitemap:", error);
  }

  return [
    { url: siteUrl, lastModified, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/top-bookmarks`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms-and-conditions`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...memberPages,
  ];
}
