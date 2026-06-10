export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "https://mybookmarking.vercel.app"
).replace(/\/$/, "");

export const siteDescription =
  "Discover, organize, publish, and discuss useful websites with the MyBookmark community.";
