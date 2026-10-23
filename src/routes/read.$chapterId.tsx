import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/Shell";
import { getChapterPages } from "@/lib/mangadex.functions";

const pagesQ = (chapterId: string) =>
  queryOptions({
    queryKey: ["md", "pages", chapterId],
    queryFn: () => getChapterPages({ data: { chapterId } }),
    staleTime: 60000,
    gcTime: 60000,
    retry: 1,
  });

export const Route = createFileRoute("/read/$chapterId")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(pagesQ(params.chapterId));
    return { title: p.title, chapter: p.chapter };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Chapter ${loaderData?.chapter ?? ""} — Ritxx Read` },
      { name: "description", content: `Read chapter ${loaderData?.chapter ?? ""} on Ritxx Read` },
      { property: "og:title", content: `Chapter ${loaderData?.chapter ?? ""} — Ritxx Read` },
      { property: "og:description", content: `Read chapter ${loaderData?.chapter ?? ""} on Ritxx Read` },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReaderPage,
  pendingMs: 200,
  pendingComponent: ReaderPending,
  errorComponent: ReaderError,
});

function ReaderPending() {
  return <Shell><div className="mx-auto flex max-w-2xl items-center justify-center gap-3 px-4 py-16" role="status"><LoaderCircle className="h-5 w-5 animate-spin motion-reduce:animate-none" /><p>Loading chapter…</p></div></Shell>;
}

function ReaderError() {
  const router = useRouter();
  const boundary = useQueryErrorResetBoundary();
  return <Shell><div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="font-display text-3xl">Chapter couldn't load</h1><p className="mt-3 text-sm text-muted-foreground">MangaDex may be temporarily unavailable, or this chapter may have been removed.</p><div className="mt-6 flex justify-center gap-3"><Button onClick={() => { boundary.reset(); void router.invalidate(); }}><RotateCcw />Try again</Button><Button asChild variant="outline"><Link to="/search" search={{ q: "" }}>Browse manga</Link></Button></div></div></Shell>;
}

function ReaderPage() {
  const { chapterId } = Route.useParams();
  const { data, refetch, isFetching } = useSuspenseQuery(pagesQ(chapterId));
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [attempt, setAttempt] = useState(0);

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-2 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4 px-2">
          {data.mangaId ? <Link
            to="/manga/$id"
            params={{ id: data.mangaId }}
            className="text-sm text-primary hover:underline"
          >
            ← Back to manga
          </Link> : <Link to="/search" search={{ q: "" }} className="text-sm text-primary hover:underline">← Browse manga</Link>}
          <span className="min-w-0 text-right text-sm text-muted-foreground">
            Chapter {data.chapter ?? "?"}
            {data.title ? ` — ${data.title}` : ""}
          </span>
        </div>

        {failed.size > 0 && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-border p-4" role="alert"><p className="text-sm text-muted-foreground">Some pages couldn't load.</p><Button disabled={isFetching} onClick={async () => { await refetch(); setFailed(new Set()); setAttempt((n) => n + 1); }}><RotateCcw />Reload pages</Button></div>}
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          {data.pages.map((src, i) => (
            <div key={`${src}-${attempt}`} className="w-full">
            {failed.has(i) ? <div className="flex min-h-60 items-center justify-center bg-muted text-sm text-muted-foreground">Page {i + 1} unavailable</div> : <img
              src={src}
              alt={`Page ${i + 1}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailed((previous) => new Set([...previous, i]))}
              className="min-h-60 w-full"
            />}
            </div>
          ))}
        </div>

        <div className="py-8 text-center">
          {data.mangaId ? <Button asChild><Link
            to="/manga/$id"
            params={{ id: data.mangaId }}
          >
            Back to chapter list
          </Link></Button> : <Button asChild><Link to="/search" search={{ q: "" }}>Browse manga</Link></Button>}
        </div>
      </div>
    </Shell>
  );
}
