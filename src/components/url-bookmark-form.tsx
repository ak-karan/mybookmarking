"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { createBookmark } from "../app/actions";

type Metadata = {
  title: string;
  description: string;
  keywords: string[];
};

export function UrlBookmarkForm() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function fetchDetails() {
    setError("");
    setMetadata(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to fetch URL details.");
        return;
      }

      setMetadata(data);
    });
  }

  return (
    <form action={createBookmark} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/useful-page"
          className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
        <button
          type="button"
          onClick={fetchDetails}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
          Fetch
        </button>
      </div>

      {metadata && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-bold text-slate-950">{metadata.title}</p>
          {metadata.description && (
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
              {metadata.description}
            </p>
          )}
          {metadata.keywords.length > 0 && (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {metadata.keywords.map((keyword) => `#${keyword}`).join(" ")}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <input type="hidden" name="title" value={metadata?.title ?? ""} />
      <input type="hidden" name="description" value={metadata?.description ?? ""} />
      <input type="hidden" name="tags" value={metadata?.keywords.join(", ") ?? ""} />
      <input type="hidden" name="categories" value="general" />

      <button className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
        Submit listing
      </button>
    </form>
  );
}
