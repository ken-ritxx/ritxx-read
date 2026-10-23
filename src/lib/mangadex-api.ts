import { z } from "zod";

const API = "https://api.mangadex.org";

async function fetchJson(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "RitxxRead/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`MangaDex request failed (${response.status})`);
    const json = await response.json();
    if (json?.result !== "ok") throw new Error("MangaDex returned an unavailable response");
    return json;
  } finally {
    clearTimeout(timer);
  }
}

// A stalled proxy must not prevent the existing server-side fallback from running.
export async function mangaDexJson(path: string) {
  const url = API + path;
  try {
    return await fetchJson(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, 6000);
  } catch {
    try {
      return await fetchJson(url, 10000);
    } catch (error) {
      console.error("MangaDex unavailable", error);
      throw new Error("MangaDex is temporarily unavailable. Please try again.");
    }
  }
}

const atHomeSchema = z.object({
  baseUrl: z.string().url().refine((url) => url.startsWith("https://")),
  chapter: z.object({
    hash: z.string().min(1),
    data: z.array(z.string().min(1)),
    dataSaver: z.array(z.string().min(1)).optional(),
  }),
});

export function chapterImageUrls(input: unknown) {
  const home = atHomeSchema.parse(input);
  const fullQuality = home.chapter.data.length > 0;
  const files = fullQuality ? home.chapter.data : home.chapter.dataSaver ?? [];
  if (!files.length) throw new Error("This chapter has no readable pages on MangaDex.");
  const base = `${home.baseUrl.replace(/\/$/, "")}/${fullQuality ? "data" : "data-saver"}/${home.chapter.hash}/`;
  return files.map((file) => base + file);
}