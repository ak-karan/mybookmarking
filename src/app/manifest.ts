import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyBookmark",
    short_name: "MyBookmark",
    description: "Discover, save, and share useful websites.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [{ src: "/icon.jpg", sizes: "180x180", type: "image/jpeg" }],
  };
}
