"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createBookmark } from "../app/actions";

type Metadata = {
  title: string;
  description: string;
  keywords: string[];
};

export function UrlBookmarkForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [url, setUrl] = useState("");
  const [fetchedUrl, setFetchedUrl] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState("");
  const [inputResetKey, setInputResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function fetchDetails() {
    setError("");
    setMetadata(null);

    const submittedUrl = url.trim();

    if (!submittedUrl) {
      setError("Please enter a URL.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/fetch-metadata", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: submittedUrl }),
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Unable to fetch URL details.");
          return;
        }

        setFetchedUrl(submittedUrl);
        setMetadata(data);
        setUrl("");
      } catch {
        setError("Unable to fetch URL details.");
      }
    });
  }

  async function submitBookmark(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    try {
      await createBookmark(formData);
      setUrl("");
      setFetchedUrl("");
      setMetadata(null);
      formRef.current?.reset();
      setInputResetKey((key) => key + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the bookmark."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} action={submitBookmark} autoComplete="off" className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          key={inputResetKey}
          type="url"
          autoComplete="off"
          required={!fetchedUrl}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setFetchedUrl("");
            setMetadata(null);
          }}
          placeholder="https://example.com/useful-page"
          className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
        <button
          type="button"
          onClick={fetchDetails}
          disabled={isPending || isSubmitting}
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

      <input type="hidden" name="url" value={url.trim() || fetchedUrl} />
      <input type="hidden" name="title" value={metadata?.title ?? ""} />
      <input type="hidden" name="description" value={metadata?.description ?? ""} />
      <input type="hidden" name="tags" value={metadata?.keywords.join(", ") ?? ""} />
      <input type="hidden" name="categories" value="general" />

      <button
        disabled={isPending || isSubmitting || (!url.trim() && !fetchedUrl)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={17} />}
        {isSubmitting ? "Submitting..." : "Submit listing"}
      </button>
    </form>
  );
}
