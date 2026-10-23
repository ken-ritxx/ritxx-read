import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mangaDexJson as md, chapterImageUrls } from "./mangadex-api";

export type MangaCard = { id: string; title: string; cover: string | null; status?: string; year?: number | null };

function pickTitle(attr: any): string {
  const t = attr.title || {};
  return t.en || t["ja-ro"] || Object.values(t)[0] || (attr.altTitles?.find((a: any) => a.en)?.en ?? "Untitled");
}

export function proxied(url: string) {
  return url;
}

function toCard(m: any): MangaCard {
  const rel = m.relationships?.find((r: any) => r.type === "cover_art");
  const file = rel?.attributes?.fileName;
  return {
    id: m.id,
    title: pickTitle(m.attributes),
    cover: file ? proxied(`https://uploads.mangadex.org/covers/${m.id}/${file}.512.jpg`) : null,
    status: m.attributes.status,
    year: m.attributes.year,
  };
}

const RATINGS = "&contentRating[]=safe&contentRating[]=suggestive";

export const searchManga = createServerFn({ method: "GET" })
  .inputValidator((d: { q?: string; order?: string; limit?: number }) => z.object({ q: z.string().max(200).optional(), order: z.enum(["followedCount", "relevance", "latestUploadedChapter", "createdAt", "rating", "year"]).optional(), limit: z.number().int().min(1).max(100).optional() }).parse(d))
  .handler(async ({ data }) => {
    const q = data.q ? `&title=${encodeURIComponent(data.q)}` : "";
    const order = data.order ?? "followedCount";
    const j = await md(
      `/manga?limit=${data.limit ?? 24}${q}&includes[]=cover_art&availableTranslatedLanguage[]=en&order[${order}]=desc${RATINGS}`,
    );
    return (j.data as any[]).map(toCard);
  });

export const getManga = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const j = await md(`/manga/${data.id}?includes[]=cover_art&includes[]=author`);
    const m = j.data;
    const card = toCard(m);
    const author = m.relationships.find((r: any) => r.type === "author")?.attributes?.name ?? null;
    return {
      ...card,
      author,
      description: (m.attributes.description?.en ?? "") as string,
      tags: (m.attributes.tags as any[]).map((t) => t.attributes.name.en as string),
      anilistId: (m.attributes.links?.al as string) ?? null,
    };
  });

export type Chapter = { id: string; chapter: string | null; title: string | null; volume: string | null; group: string | null; publishAt: string };

export const getChapters = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const out: Chapter[] = [];
    for (let offset = 0; offset < 1000; offset += 500) {
      const j = await md(
        `/manga/${data.id}/feed?limit=500&offset=${offset}&translatedLanguage[]=en&order[chapter]=desc&includes[]=scanlation_group&includeExternalUrl=0${RATINGS}`,
      );
      for (const c of j.data as any[]) {
        if (c.attributes.pages === 0) continue;
        out.push({
          id: c.id,
          chapter: c.attributes.chapter,
          title: c.attributes.title,
          volume: c.attributes.volume,
          group: c.relationships.find((r: any) => r.type === "scanlation_group")?.attributes?.name ?? null,
          publishAt: c.attributes.publishAt,
        });
      }
      if (offset + 500 >= j.total) break;
    }
    // dedupe by chapter number
    const seen = new Set<string>();
    return out.filter((c) => {
      const k = c.chapter ?? c.id;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  });

export const getChapterPages = createServerFn({ method: "GET" })
  .inputValidator((d: { chapterId: string }) => z.object({ chapterId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const [home, ch] = await Promise.all([
      md(`/at-home/server/${data.chapterId}`),
      md(`/chapter/${data.chapterId}?includes[]=manga`).catch(() => null),
    ]);
    const mangaId = (ch?.data?.relationships?.find((r: any) => r.type === "manga")?.id as string | undefined) ?? null;
    return {
      pages: chapterImageUrls(home),
      mangaId,
      chapter: (ch?.data?.attributes?.chapter as string | undefined) ?? null,
      title: (ch?.data?.attributes?.title as string | undefined) ?? null,
    };
  });

export const findByAnilist = createServerFn({ method: "GET" })
  .inputValidator((d: { title: string; alId: number }) => z.object({ title: z.string().min(1).max(200), alId: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => {
    const j = await md(`/manga?limit=10&title=${encodeURIComponent(data.title)}&order[relevance]=desc${RATINGS}&contentRating[]=erotica`);
    const list = j.data as any[];
    const exact = list.find((m) => m.attributes.links?.al === String(data.alId));
    return (exact ?? list[0])?.id ?? null;
  });
