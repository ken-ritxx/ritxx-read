export type AlManga = {
  id: number;
  title: { english: string | null; romaji: string };
  coverImage: { large: string; color: string | null };
  bannerImage: string | null;
  averageScore: number | null;
  description: string | null;
  genres: string[];
};

const FIELDS = `id title{english romaji} coverImage{large color} bannerImage averageScore description(asHtml:false) genres`;

export async function anilistList(sort: "TRENDING_DESC" | "POPULARITY_DESC" | "SCORE_DESC", perPage = 18) {
  const query = `query($s:[MediaSort]){Page(perPage:${perPage}){media(type:MANGA,sort:$s,isAdult:false){${FIELDS}}}}`;
  const r = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { s: [sort] } }),
  });
  if (!r.ok) throw new Error("AniList error");
  const j = await r.json();
  return j.data.Page.media as AlManga[];
}

export const alTitle = (m: AlManga) => m.title.english || m.title.romaji;

async function al(query: string, variables: Record<string, unknown>) {
  const r = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error("AniList error");
  return (await r.json()).data;
}

export async function anilistSearch(q: string) {
  const sort = q ? "SEARCH_MATCH" : "POPULARITY_DESC";
  const d = await al(`query($q:String){Page(perPage:36){media(type:MANGA,search:$q,isAdult:false,sort:${sort}){${FIELDS}}}}`, { q: q || undefined });
  return d.Page.media as AlManga[];
}

export async function anilistCover(id: number) {
  const d = await al(`query($id:Int){Media(id:$id){coverImage{extraLarge}}}`, { id });
  return d.Media.coverImage.extraLarge as string;
}
