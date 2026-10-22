import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { anilistSearch } from "@/lib/anilist";
import { AlCard } from "@/components/AlCard";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : "" }),
  head: () => ({
    meta: [
      { title: "Browse Manga — Ritxx Read" },
      { name: "description", content: "Search and browse thousands of manga on Ritxx Read." },
      { property: "og:title", content: "Browse Manga — Ritxx Read" },
      { property: "og:description", content: "Search and browse thousands of manga." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isPending } = useQuery({ queryKey: ["al", "search", q], queryFn: () => anilistSearch(q) });
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-6 font-display text-4xl">{q ? `Results for "${q}"` : "Most Popular"}</h1>
        {isPending && <p className="text-muted-foreground">Loading…</p>}
        {data?.length === 0 && <p className="text-muted-foreground">No manga found.</p>}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {data?.map((m) => <AlCard key={m.id} m={m} />)}
        </div>
      </div>
    </Shell>
  );
}
