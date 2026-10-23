import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { AlCard } from "@/components/AlCard";
import { anilistList, alTitle, type AlManga } from "@/lib/anilist";
import { findByAnilist } from "@/lib/mangadex.functions";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ritxx Read — Read Manga Online" },
      { name: "description", content: "Read manga free on Ritxx Read. Trending picks from AniList, chapters from MangaDex." },
      { property: "og:title", content: "Ritxx Read — Read Manga Online" },
      { property: "og:description", content: "Trending manga from AniList, chapters from MangaDex." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const top = useQuery({ queryKey: ["al", "top"], queryFn: () => anilistList("SCORE_DESC", 12) });
  const trending = useQuery({ queryKey: ["al", "trending"], queryFn: () => anilistList("TRENDING_DESC") });
  const popular = useQuery({ queryKey: ["al", "popular"], queryFn: () => anilistList("POPULARITY_DESC", 12) });
  const hero = trending.data?.find((m) => m.bannerImage);

  return (
    <Shell>
      <section className="relative h-[380px] overflow-hidden border-b border-border">
        {hero?.bannerImage && <img src={hero.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">#1 Trending on AniList</p>
          <h1 className="mt-2 max-w-3xl font-display text-5xl leading-none md:text-7xl">
            {hero ? alTitle(hero) : "Ritxx Read"}
          </h1>
          {hero && <div className="mt-6"><HeroBtn m={hero} /></div>}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pt-10">
        <Row title="Trending Now">
          {trending.data?.map((m) => <AlCard key={m.id} m={m} />) ?? <Skel n={12} />}
        </Row>
        <Row title="Top Rated">
          {top.data?.map((m) => <AlCard key={m.id} m={m} />) ?? <Skel n={12} />}
        </Row>
        <Row title="All-Time Popular">
          {popular.data?.map((m) => <AlCard key={m.id} m={m} />) ?? <Skel n={12} />}
        </Row>
      </div>
    </Shell>
  );
}

function HeroBtn({ m }: { m: AlManga }) {
  const nav = useNavigate();
  return (
    <button
      className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
      onClick={async () => {
        const id = await findByAnilist({ data: { title: m.title.romaji, alId: m.id } });
        if (id) nav({ to: "/manga/$id", params: { id } });
      }}
    >
      Read Now
    </button>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 border-l-4 border-primary pl-3 font-display text-3xl tracking-wide">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">{children}</div>
    </section>
  );
}

function Skel({ n }: { n: number }) {
  return <>{Array.from({ length: n }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-muted" />)}</>;
}
