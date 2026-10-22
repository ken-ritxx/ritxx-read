import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Shell, Cover } from "@/components/Shell";
import { searchManga } from "@/lib/mangadex.functions";

const q = (s: string) =>
  queryOptions({ queryKey: ["md", "search", s], queryFn: () => searchManga({ data: { q: s, limit: 36 } }) });

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(q(deps.q)),
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
  const { q: s } = Route.useSearch();
  const { data } = useSuspenseQuery(q(s));
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-6 font-display text-4xl">{s ? `Results for "${s}"` : "Most Followed"}</h1>
        {data.length === 0 && <p className="text-muted-foreground">No manga found.</p>}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {data.map((m) => (
            <Link key={m.id} to="/manga/$id" params={{ id: m.id }} className="group">
              <Cover src={m.cover} title={m.title} />
              <p className="mt-2 line-clamp-2 text-sm font-medium">{m.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
