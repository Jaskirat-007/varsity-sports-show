import React, { useMemo, useState } from "react";
import {
  Play,
  Calendar,
  Clock,
  Search,
  Filter as FilterIcon,
  Rows,
  Columns,
  Ticket,
  ExternalLink,
  Tv,
  Radio,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

// --- UI helpers ---
// (For demo) Replace with real RBAC using Clerk org roles/claims
const isAdmin = true; // TODO: read from Clerk session/claims

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
  );
}

function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition shadow-sm ${
        active
          ? "bg-black text-white border-black"
          : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}

// --- Types & mock data ---
export type StreamStatus = "live" | "upcoming" | "ended";
export type Stream = {
  id: string;
  title: string;
  league: string; // e.g., HS Football
  schoolA: string;
  schoolB: string;
  startAt: string; // ISO
  priceUSD?: number; // undefined means free
  status: StreamStatus;
  thumbnail: string; // url or placeholder
  slug: string; // /live/[slug]
};

const MOCK_STREAMS: Stream[] = [
  {
    id: "1",
    title: "Friday Night Lights: Wolves vs. Tigers",
    league: "HS Football",
    schoolA: "Desert Ridge",
    schoolB: "Mesa East",
    startAt: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
    priceUSD: 6.99,
    status: "live",
    thumbnail: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=1200&q=80&auto=format&fit=crop",
    slug: "wolves-vs-tigers-2025w10",
  },
  {
    id: "2",
    title: "Varsity Basketball: Hawks @ Cougars",
    league: "HS Basketball",
    schoolA: "Tempe Hawks",
    schoolB: "Saguaro Cougars",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    priceUSD: 4.99,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80&auto=format&fit=crop",
    slug: "hawks-at-cougars-2025w10",
  },
  {
    id: "3",
    title: "Girls Volleyball Finals: Suns vs. Bears",
    league: "HS Volleyball",
    schoolA: "Arcadia Suns",
    schoolB: "Gilbert Bears",
    startAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    priceUSD: undefined,
    status: "ended",
    thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80&auto=format&fit=crop",
    slug: "suns-vs-bears-2025-finals",
  },
  {
    id: "4",
    title: "Baseball Semifinal: Knights vs. Mustangs",
    league: "HS Baseball",
    schoolA: "North Knights",
    schoolB: "West Mustangs",
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    priceUSD: 7.99,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80&auto=format&fit=crop",
    slug: "knights-vs-mustangs-2025-semi",
  },
];

// --- Stream card ---
function StreamCard({
  stream,
  layout = "grid",
  onDelete,
}: {
  stream: Stream;
  layout?: "grid" | "list";
  onDelete?: (id: string) => void;
}) {
  const date = new Date(stream.startAt);
  const timeText = date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const statusStyles: Record<StreamStatus, string> = {
    live: "bg-red-50 text-red-700 ring-1 ring-red-200",
    upcoming: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    ended: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
  };

  return (
    <Card className={layout === "list" ? "flex overflow-hidden" : "overflow-hidden"}>
      <div className={layout === "list" ? "w-48 shrink-0" : "aspect-video w-full"}>
        <div className="relative h-full w-full bg-neutral-200">
          {/* Thumbnail */}
          <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
          {/* Status badge */}
          <div className="absolute left-2 top-2 flex items-center gap-2">
            <Badge className={statusStyles[stream.status] + " backdrop-blur"}>
              {stream.status === "live" ? (
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> LIVE</span>
              ) : stream.status === "upcoming" ? (
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Upcoming</span>
              ) : (
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Past</span>
              )}
            </Badge>
            {typeof stream.priceUSD === "number" ? (
              <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200"><Ticket className="h-3 w-3 mr-1" />${stream.priceUSD.toFixed(2)}</Badge>
            ) : (
              <Badge className="bg-sky-50 text-sky-700 ring-1 ring-sky-200">Free</Badge>
            )}
          </div>
        </div>
      </div>

      <div className={layout === "list" ? "flex-1 p-4" : "p-4"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight line-clamp-2">{stream.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              <span className="font-medium">{stream.schoolA}</span> vs <span className="font-medium">{stream.schoolB}</span>
              <span className="mx-2">·</span>
              <span className="text-neutral-500">{stream.league}</span>
            </p>
          </div>
          <a
            href={`/live/${stream.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
            title="Open stream"
          >
            {stream.status === "live" ? <Play className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} Open
          </a>
        </div>
        <div className="mt-2 text-sm text-neutral-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{timeText}</span>
        </div>
      </div>
    </Card>
  );
}

// --- Empty state ---
function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Tv className="h-6 w-6 text-neutral-600" />
      </div>
      <h3 className="text-lg font-semibold">No streams {label}</h3>
      <p className="mt-1 text-sm text-neutral-600">Check back later or browse other categories.</p>
    </div>
  );
}

// --- Create Stream Modal (admin) ---
function CreateStreamModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (s: Stream) => void }) {
  const [title, setTitle] = useState("");
  const [league, setLeague] = useState("HS Football");
  const [schoolA, setSchoolA] = useState("");
  const [schoolB, setSchoolB] = useState("");
  const [startAt, setStartAt] = useState<string>(new Date(Date.now() + 3_600_000).toISOString().slice(0,16)); // datetime-local value
  const [price, setPrice] = useState<string>("6.99");
  const [thumbnail, setThumbnail] = useState("");
  const [sourceUrl, setSourceUrl] = useState(""); // e.g., m3u8 or Dacast channel id
  const [access, setAccess] = useState<'free'|'ppv'|'subscriber'>("ppv");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const toSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64);

  const handleCreate = async () => {
    if (!title || !schoolA || !schoolB) return alert("Title/Schools are required");
    const priceNum = access === 'free' ? undefined : Number(price || 0);
    const payload = {
      title,
      league,
      schoolA,
      schoolB,
      startAt: new Date(startAt).toISOString(),
      priceUSD: priceNum,
      status: new Date(startAt).getTime() <= Date.now() ? 'live' as const : 'upcoming' as const,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1521417531039-6949f3f9f2b5?w=1200&auto=format&fit=crop",
      slug: toSlug(`${schoolA}-${schoolB}-${title}`),
      sourceUrl,
      access,
    };

    try {
      setSubmitting(true);
      // --- optimistic demo --- replace with real POST /api/streams
      // await fetch('/api/streams', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      const created: Stream = {
        id: String(Math.random()).slice(2),
        title: payload.title,
        league: payload.league,
        schoolA: payload.schoolA,
        schoolB: payload.schoolB,
        startAt: payload.startAt,
        priceUSD: payload.priceUSD,
        status: payload.status,
        thumbnail: payload.thumbnail,
        slug: payload.slug,
      };
      onCreated(created);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Create Livestream</h3>
          <button onClick={onClose} className="rounded-full border px-3 py-1.5 text-sm">Close</button>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Title</span>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g., Wolves vs Tigers" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">League</span>
            <input value={league} onChange={(e)=>setLeague(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="HS Football" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Home / School A</span>
            <input value={schoolA} onChange={(e)=>setSchoolA(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Desert Ridge" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Away / School B</span>
            <input value={schoolB} onChange={(e)=>setSchoolB(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Mesa East" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Start Time</span>
            <input type="datetime-local" value={startAt} onChange={(e)=>setStartAt(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Access</span>
            <select value={access} onChange={(e)=>setAccess(e.target.value as any)} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="free">Free</option>
              <option value="ppv">Pay‑per‑view</option>
              <option value="subscriber">Subscribers only</option>
            </select>
          </label>
          {access !== 'free' && (
            <label className="space-y-1">
              <span className="text-sm font-medium">Price (USD)</span>
              <input value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="6.99" />
            </label>
          )}
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium">Thumbnail URL</span>
            <input value={thumbnail} onChange={(e)=>setThumbnail(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium">Stream Source (m3u8 / Dacast Channel ID)</span>
            <input value={sourceUrl} onChange={(e)=>setSourceUrl(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g., https://.../index.m3u8 or 12345" />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          <button disabled={submitting} onClick={handleCreate} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard ---
export default function DashboardUI() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StreamStatus | "all">("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const [createOpen, setCreateOpen] = useState(false);
  const [streams, setStreams] = useState<Stream[]>(MOCK_STREAMS);

  const filtered = useMemo(() => {
    return streams.filter((s) => (tab === "all" ? true : s.status === tab)).filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = `${s.title} ${s.schoolA} ${s.schoolB} ${s.league}`.toLowerCase();
      return hay.includes(q);
    });
    return MOCK_STREAMS.filter((s) => (tab === "all" ? true : s.status === tab)).filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = `${s.title} ${s.schoolA} ${s.schoolB} ${s.league}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, tab]);

  const live = filtered.filter((s) => s.status === "live");
  const upcoming = filtered.filter((s) => s.status === "upcoming");
  const ended = filtered.filter((s) => s.status === "ended");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight">Dashboard</h1>
              <p className="text-sm text-neutral-600">Welcome back! Browse your live and upcoming games.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search teams, league, title..."
                  className="w-72 rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <Pill active={tab === "all"} onClick={() => setTab("all")}>All</Pill>
                <Pill active={tab === "live"} onClick={() => setTab("live")}>Live</Pill>
                <Pill active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</Pill>
                <Pill active={tab === "ended"} onClick={() => setTab("ended")}>Past</Pill>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <button
                  onClick={() => setLayout("grid")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                    layout === "grid" ? "bg-black text-white" : "hover:bg-neutral-50"
                  }`}
                  title="Grid"
                >
                  <Columns className="h-4 w-4" /> Grid
                </button>
                <button
                  onClick={() => setLayout("list")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                    layout === "list" ? "bg-black text-white" : "hover:bg-neutral-50"
                  }`}
                  title="List"
                >
                  <Rows className="h-4 w-4" /> List
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <UserButton
                appearance={{
                  elements: {
                    avatarImage: "rounded-full border-2 border-violet-600",
                  },
                }}
              />
            </div>

          </div>
        </div>
      </header>

      {/* Admin Create Stream */}
      {isAdmin && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">Sponsor tools</h3>
                <p className="text-sm text-neutral-600">Create or manage livestream pages. Published items appear above.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setCreateOpen(true)} className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Create livestream</button>
                <a href="/dashboard/streams" className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">Manage all</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateStreamModal
        open={createOpen}
        onClose={()=>setCreateOpen(false)}
        onCreated={(s)=> setStreams((prev)=>[s, ...prev])}
      />

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Live section */}
        {tab === "all" || tab === "live" ? (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Live now</h2>
              <a href="/live" className="text-sm text-neutral-700 hover:underline">View all</a>
            </div>
            {live.length === 0 ? (
              <EmptyState label="live right now" />
            ) : layout === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {live.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="list" />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* Upcoming */}
        {tab === "all" || tab === "upcoming" ? (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming</h2>
              <button className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50">
                <FilterIcon className="h-4 w-4" /> Filters
              </button>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState label="upcoming yet" />
            ) : layout === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="list" />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* Past */}
        {tab === "all" || tab === "ended" ? (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Past Games</h2>
              <a href="/replays" className="text-sm text-neutral-700 hover:underline">Browse replays</a>
            </div>
            {ended.length === 0 ? (
              <EmptyState label="in your history" />
            ) : layout === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ended.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ended.map((s) => (
                  <StreamCard key={s.id} stream={s} layout="list" />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
            <Radio className="h-5 w-5 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold">Looking for a specific matchup?</h3>
          <p className="mt-1 text-sm text-neutral-600">Use the search above or go to the full schedule to find your team.</p>
          <div className="mt-4 inline-flex gap-2">
            <a href="/schedule" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Full schedule</a>
            <a href="/subscriptions" className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">Subscription plans</a>
          </div>
        </div>
      </main>
    </div>
  );
}
