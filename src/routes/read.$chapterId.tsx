import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { getChapterPages } from "@/lib/mangadex.functions";

const pagesQ = (chapterId: string) =>
  queryOptions({
    queryKey: ["md", "pages", chapterId],
    queryFn: () => getChapterPages({ data: { chapterId } }),
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
});

function ReaderPage() {
  const { chapterId } = Route.useParams();
  const { data } = useSuspenseQuery(pagesQ(chapterId));

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-2 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4 px-2">
          <Link
            to="/manga/$id"
            params={{ id: data.mangaId }}
            className="text-sm text-primary hover:underline"
          >
            ← Back to manga
          </Link>
          <span className="text-sm text-muted-foreground">
            Chapter {data.chapter ?? "?"}
            {data.title ? ` — ${data.title}` : ""}
          </span>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center">
          {data.pages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Page ${i + 1}`}
              loading="lazy"
              className="w-full"
            />
          ))}
        </div>

        <div className="py-8 text-center">
          <Link
            to="/manga/$id"
            params={{ id: data.mangaId }}
            className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Back to chapter list
          </Link>
        </div>
      </div>
    </Shell>
  );
}
