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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [inputResetKey, setInputResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function fetchDetails() {
    setError("");

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
        const data = (await response.json()) as Metadata & { error?: string };

        if (!response.ok) {
          setError(data.error ?? "Unable to fetch URL details.");
          return;
        }

        setFetchedUrl(submittedUrl);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setKeywords(Array.isArray(data.keywords) ? data.keywords.join(", ") : "");
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
      const result = await createBookmark(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setUrl("");
      setFetchedUrl("");
      setTitle("");
      setDescription("");
      setKeywords("");
      setCategory("");
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
            setTitle("");
            setDescription("");
            setKeywords("");
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

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Category <span className="text-rose-600">*</span>
        </span>
        <input
          name="categories"
          required
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="technology"
          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Title (optional)</span>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          placeholder="Custom listing title"
          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Description (optional)
        </span>
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Short description"
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Keywords (optional)
        </span>
        <input
          name="tags"
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          placeholder="design, tools, inspiration"
          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
        />
      </label>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <input type="hidden" name="url" value={url.trim() || fetchedUrl} />

      <button
        disabled={isPending || isSubmitting || (!url.trim() && !fetchedUrl) || !category.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={17} />}
        {isSubmitting ? "Submitting..." : "Submit listing"}
      </button>
    </form>
  );
}
