import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../lib/providers";
import { siteDescription, siteUrl } from "../lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MyBookmark - Discover and Save Useful Websites",
    template: "%s | MyBookmark",
  },
  description: siteDescription,
  applicationName: "MyBookmark",
  keywords: [
    "bookmarks",
    "social bookmarking",
    "save websites",
    "useful links",
    "website directory",
    "bookmark manager",
  ],
  authors: [{ name: "MyBookmark", url: siteUrl }],
  creator: "MyBookmark",
  publisher: "MyBookmark",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "MyBookmark",
    title: "MyBookmark - Discover and Save Useful Websites",
    description: siteDescription,
    images: [{ url: "/logo.jpg", width: 260, height: 70, alt: "MyBookmark" }],
  },
  twitter: {
    card: "summary",
    title: "MyBookmark - Discover and Save Useful Websites",
    description: siteDescription,
    images: ["/icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "VsWtrsOTU82Y6-7_8QJN_Lx5MWwvxfvzOeh2lnA7ohg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MyBookmark",
        url: siteUrl,
        logo: `${siteUrl}/icon.jpg`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "MyBookmark",
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
