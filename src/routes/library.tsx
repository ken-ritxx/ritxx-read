import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Cover } from "@/components/Shell";
import { useList, clearRecent, type RecentRead, type SavedManga } from "@/lib/library";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My Library — Ritxx Read" },
      { name: "description", content: "Your saved, liked and recently read manga on Ritxx Read." },
      { property: "og:title", content: "My Library — Ritxx Read" },
      { property: "og:description", content: "Saved, liked and recently read manga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LibraryPage,
});

const TABS = [
  { k: "recent", label: "Recently Read" },
  { k: "library", label: "Library" },
  { k: "liked", label: "Liked" },
] as const;

function LibraryPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["k"]>("recent");
  const recent = useList<RecentRead>("recent");
  const library = useList<SavedManga>("library");
  const liked = useList<SavedManga>("liked");
  const items = tab === "recent" ? recent : tab === "library" ? library : liked;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-6 font-display text-4xl">My Library</h1>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === t.k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t.label}
            </button>
          ))}
          {tab === "recent" && recent.length > 0 && (
            <button onClick={clearRecent} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear history</button>
          )}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Nothing here yet.</p>}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {items.map((m) => {
            const r = tab === "recent" ? (m as RecentRead) : null;
            return r ? (
              <Link key={m.id} to="/read/$chapterId" params={{ chapterId: r.chapterId }} className="group">
                <Cover src={m.cover} title={m.title} />
                <p className="mt-2 line-clamp-2 text-sm font-medium">{m.title}</p>
                <p className="text-xs text-primary">Continue Ch. {r.chapter ?? "?"}</p>
              </Link>
            ) : (
              <Link key={m.id} to="/manga/$id" params={{ id: m.id }} className="group">
                <Cover src={m.cover} title={m.title} />
                <p className="mt-2 line-clamp-2 text-sm font-medium">{m.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
