export const bookmarkCategories = [
  "AI & Tools",
  "Art & Design",
  "Business",
  "Education",
  "Entertainment",
  "Finance",
  "Food & Recipes",
  "General",
  "Health & Fitness",
  "Jobs & Careers",
  "Marketing & SEO",
  "Mobile Apps",
  "News & Media",
  "Science",
  "Shopping",
  "Social Media",
  "Sports",
  "Technology",
  "Travel",
  "Web Development",
  "Other",
] as const;

export function normalizeCategory(value: string) {
  const normalized = value.trim().toLowerCase();
  return bookmarkCategories.find((category) => category.toLowerCase() === normalized);
}
