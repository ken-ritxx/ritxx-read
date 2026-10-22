import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Cover } from "@/components/Shell";
import { alTitle, type AlManga } from "@/lib/anilist";
import { findByAnilist } from "@/lib/mangadex.functions";

export function AlCard({ m }: { m: AlManga }) {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="group text-left"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const id = await findByAnilist({ data: { title: m.title.romaji, alId: m.id } });
        setBusy(false);
        if (id) nav({ to: "/manga/$id", params: { id } });
        else nav({ to: "/search", search: { q: alTitle(m) } });
      }}
    >
      <div className="relative">
        <Cover src={m.coverImage.large} title={alTitle(m)} />
        {m.averageScore && (
          <span className="absolute right-1 top-1 rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">
            {m.averageScore}%
          </span>
        )}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs">Opening…</div>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium">{alTitle(m)}</p>
    </button>
  );
}

