import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { anilistSearch, type MangaType } from "@/lib/anilist";
import { Link } from "@tanstack/react-router";
import { AlCard } from "@/components/AlCard";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q: string; type?: MangaType } => ({
    q: typeof s["q"] === "string" ? s["q"] : "",
    type: ["manga", "manhwa", "manhua"].includes(s["type"] as string) ? (s["type"] as MangaType) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Manga — Ritxx Read" },
      { name: "description", content: "Search and browse thousands of manga on Ritxx Read." },
      { property: "og:title", content: "Browse Manga — Ritxx Read" },
      { property: "og:description", content: "Search and browse thousands of manga." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, type = "" } = Route.useSearch();
  const { data, isPending } = useQuery({ queryKey: ["al", "search", q, type], queryFn: () => anilistSearch(q, type) });
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-4 font-display text-4xl">{q ? `Results for "${q}"` : `Most Popular ${type ? type[0].toUpperCase() + type.slice(1) : ""}`}</h1>
        <div className="mb-6 flex flex-wrap gap-2">
          {(["", "manga", "manhwa", "manhua"] as const).map((t) => (
            <Link key={t || "all"} to="/search" search={{ q, type: t || undefined }} className={`rounded-md px-4 py-2 text-sm font-semibold ${type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t ? t[0].toUpperCase() + t.slice(1) : "All"}
            </Link>
          ))}
        </div>
        {isPending && <p className="text-muted-foreground">Loading…</p>}
        {data?.length === 0 && <p className="text-muted-foreground">No manga found.</p>}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {data?.map((m) => <AlCard key={m.id} m={m} />)}
        </div>
      </div>
    </Shell>
  );
}
