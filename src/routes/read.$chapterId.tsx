import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getChapterPages, getChapters } from "@/lib/mangadex.functions";

const pagesQ = (id: string) =>
  queryOptions({ queryKey: ["md", "pages", id], queryFn: () => getChapterPages({ data: { chapterId: id } }), staleTime: 10 * 60_000 });

export const Route = createFileRoute("/read/$chapterId")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(pagesQ(params.chapterId)),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Chapter ${loaderData?.chapter ?? ""} — Ritxx Read` },
      { name: "description", content: "Read this manga chapter on Ritxx Read." },
      { property: "og:title", content: `Chapter ${loaderData?.chapter ?? ""} — Ritxx Read` },
      { property: "og:description", content: "Read this manga chapter on Ritxx Read." },
    ],
  }),
  component: Reader,
});

function Reader() {
  const { chapterId } = Route.useParams();
  const { data } = useSuspenseQuery(pagesQ(chapterId));
  const chapters = useQuery({ queryKey: ["md", "chapters", data.mangaId], queryFn: () => getChapters({ data: { id: data.mangaId } }) });
  const list = chapters.data ?? [];
  const idx = list.findIndex((c) => c.id === chapterId);
  const next = idx > 0 ? list[idx - 1] : null; // list is desc
  const prev = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  const Nav = () => (
    <div className="flex items-center justify-center gap-3 py-4">
      {prev ? (
        <Link to="/read/$chapterId" params={{ chapterId: prev.id }} className="flex items-center gap-1 rounded-md bg-secondary px-4 py-2 text-sm"><ChevronLeft className="h-4 w-4" />Prev</Link>
      ) : <span className="px-4 py-2 text-sm text-muted-foreground">Prev</span>}
      {next ? (
        <Link to="/read/$chapterId" params={{ chapterId: next.id }} className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Next<ChevronRight className="h-4 w-4" /></Link>
      ) : <span className="px-4 py-2 text-sm text-muted-foreground">Next</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <Link to="/manga/$id" params={{ id: data.mangaId }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="font-display text-xl">Ch. {data.chapter ?? "?"}{data.title ? ` — ${data.title}` : ""}</span>
        <Link to="/" className="ml-auto font-display text-xl">RITXX<span className="text-primary">READ</span></Link>
      </header>
      <Nav />
      <div className="mx-auto max-w-3xl">
        {data.pages.map((p, i) => (
          <img key={p} src={p} alt={`Page ${i + 1}`} loading={i < 3 ? "eager" : "lazy"} className="block w-full" />
        ))}
      </div>
      <Nav />
    </div>
  );
}
