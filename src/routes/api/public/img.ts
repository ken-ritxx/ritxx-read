import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = /(^|\.)mangadex\.(org|network)$/;

export const Route = createFileRoute("/api/public/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url).searchParams.get("u");
        if (!u) return new Response("missing", { status: 400 });
        let target: URL;
        try {
          target = new URL(u);
        } catch {
          return new Response("bad url", { status: 400 });
        }
        if (target.protocol !== "https:" || !ALLOWED.test(target.hostname)) {
          return new Response("forbidden", { status: 403 });
        }
        const r = await fetch(target.toString(), { headers: { "User-Agent": "RitxxRead/1.0" } });
        if (!r.ok) return new Response("upstream " + r.status, { status: 502 });
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          headers: {
            "content-type": r.headers.get("content-type") ?? "image/jpeg",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
