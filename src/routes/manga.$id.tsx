import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Shell, Cover } from "@/components/Shell";
import { getManga, getChapters } from "@/lib/mangadex.functions";

const mangaQ = (id: string) => queryOptions({ queryKey: ["md", "manga", id], queryFn: () => getManga({ data: { id } }) });
const chQ = (id: string) => queryOptions({ queryKey: ["md", "chapters", id], queryFn: () => getChapters({ data: { id } }) });

export const Route = createFileRoute("/manga/$id")({
  loader: async ({ context, params }) => {
    const [m] = await Promise.all([
      context.queryClient.ensureQueryData(mangaQ(params.id)),
      context.queryClient.ensureQueryData(chQ(params.id)),
    ]);
    return { title: m.title, desc: m.description.slice(0, 150) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Manga"} — Ritxx Read` },
      { name: "description", content: loaderData?.desc || "Read on Ritxx Read" },
      { property: "og:title", content: `${loaderData?.title ?? "Manga"} — Ritxx Read` },
      { property: "og:description", content: loaderData?.desc || "Read on Ritxx Read" },
    ],
  }),
  component: MangaPage,
});

function MangaPage() {
  const { id } = Route.useParams();
  const { data: m } = useSuspenseQuery(mangaQ(id));
  const { data: chapters } = useSuspenseQuery(chQ(id));
  const first = chapters[chapters.length - 1];

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="w-44 md:w-full"><Cover src={m.anilistId ? null : null} title={m.title} /></div>
          <div>
            <h1 className="font-display text-5xl leading-none">{m.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {m.author} {m.year ? `· ${m.year}` : ""} {m.status ? `· ${m.status}` : ""}
              {m.anilistId && (
                <> · <a className="text-primary hover:underline" href={`https://anilist.co/manga/${m.anilistId}`} target="_blank" rel="noreferrer">AniList</a></>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.tags.slice(0, 10).map((t) => (
                <span key={t} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>
              ))}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground line-clamp-[8]">{m.description}</p>
            {first && (
              <a href={`https://mangadex.org/chapter/${first.id}`} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                Start Reading on MangaDex
              </a>
            )}
          </div>
        </div>

        <h2 className="mb-3 mt-10 border-l-4 border-primary pl-3 font-display text-3xl">Chapters ({chapters.length})</h2>
        {chapters.length === 0 && <p className="text-muted-foreground">No English chapters available on MangaDex.</p>}
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {chapters.map((c) => (
            <a key={c.id} href={`https://mangadex.org/chapter/${c.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 bg-card px-4 py-3 hover:bg-secondary">
              <span className="text-sm font-medium">
                Ch. {c.chapter ?? "?"}{c.title ? ` — ${c.title}` : ""}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{c.group ?? ""} · {new Date(c.publishAt).toLocaleDateString()}</span>
            </a>
          ))}
        </div>
      </div>
    </Shell>
  );
}
