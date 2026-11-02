import { useEffect, useState } from "react";

export type SavedManga = { id: string; title: string; cover: string | null };
export type RecentRead = SavedManga & { chapterId: string; chapter: string | null; at: number };

const KEYS = { library: "rr-library", liked: "rr-liked", recent: "rr-recent" } as const;
type Key = keyof typeof KEYS;
const EVT = "rr-store";

function read<T>(k: Key): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS[k]) || "[]");
  } catch {
    return [];
  }
}
function write<T>(k: Key, v: T[]) {
  localStorage.setItem(KEYS[k], JSON.stringify(v));
  window.dispatchEvent(new Event(EVT));
}

export function useList<T = SavedManga>(k: Key): T[] {
  const [v, setV] = useState<T[]>([]);
  useEffect(() => {
    const f = () => setV(read<T>(k));
    f();
    window.addEventListener(EVT, f);
    window.addEventListener("storage", f);
    return () => {
      window.removeEventListener(EVT, f);
      window.removeEventListener("storage", f);
    };
  }, [k]);
  return v;
}

export function toggle(k: "library" | "liked", m: SavedManga) {
  const list = read<SavedManga>(k);
  write(k, list.some((x) => x.id === m.id) ? list.filter((x) => x.id !== m.id) : [m, ...list]);
}

export function addRecent(r: RecentRead) {
  const list = read<RecentRead>("recent").filter((x) => x.id !== r.id);
  write("recent", [r, ...list].slice(0, 50));
}

export function clearRecent() {
  write("recent", []);
}
