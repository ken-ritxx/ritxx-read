import { afterEach, describe, expect, it, vi } from "vitest";
import { chapterImageUrls, mangaDexJson } from "@/lib/mangadex-api";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("MangaDex reader requests", () => {
  it("falls back when the proxy stalls instead of hanging forever", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(new Error("timeout")));
      }))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: "ok", data: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    const request = mangaDexJson("/manga");
    await vi.advanceTimersByTimeAsync(6000);
    expect(await request).toEqual({ result: "ok", data: [] });
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.allorigins.win/raw?url=https%3A%2F%2Fapi.mangadex.org%2Fmanga");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.mangadex.org/manga");
  });

  it("builds full-quality vertical reader image URLs from data filenames", () => {
    expect(chapterImageUrls({ baseUrl: "https://uploads.mangadex.org", chapter: { hash: "abc", data: ["1.jpg", "2.jpg"], dataSaver: ["small.jpg"] } }))
      .toEqual(["https://uploads.mangadex.org/data/abc/1.jpg", "https://uploads.mangadex.org/data/abc/2.jpg"]);
  });

  it("rejects a chapter without pages rather than rendering a blank reader", () => {
    expect(() => chapterImageUrls({ baseUrl: "https://uploads.mangadex.org", chapter: { hash: "abc", data: [] } })).toThrow("no readable pages");
  });
});