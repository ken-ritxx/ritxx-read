import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-display text-2xl tracking-wide">
            RITXX<span className="text-primary">READ</span>
          </Link>
          <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/search" search={{ q: "", type: "manga" }} className="hover:text-foreground">Manga</Link>
            <Link to="/search" search={{ q: "", type: "manhwa" }} className="hover:text-foreground">Manhwa</Link>
            <Link to="/search" search={{ q: "", type: "manhua" }} className="hover:text-foreground">Manhua</Link>
            <Link to="/library" className="hover:text-foreground">Library</Link>
          </nav>
          <form
            className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              nav({ to: "/search", search: { q } });
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search manga..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
          <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground md:hidden">Library</Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 pb-2 text-sm text-muted-foreground md:hidden">
          <Link to="/search" search={{ q: "", type: "manga" }}>Manga</Link>
          <Link to="/search" search={{ q: "", type: "manhwa" }}>Manhwa</Link>
          <Link to="/search" search={{ q: "", type: "manhua" }}>Manhua</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        Ritxx Read · Data from MangaDex &amp; AniList
      </footer>
    </div>
  );
}

export function Cover({ src, title }: { src: string | null; title: string }) {
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">
      {src ? (
        <img src={src} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">{title}</div>
      )}
    </div>
  );
}
