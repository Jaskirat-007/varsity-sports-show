import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Play,
  Calendar,
  Clock,
  Search,
  UserCog,
  Filter as FilterIcon,
  Rows,
  Columns,
  Ticket,
  ExternalLink,
  Tv,
  Radio,
  DotIcon,
  Trash2,
  Calendar as CalendarIcon
} from "lucide-react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import type { Stream, StreamStatus } from "@/lib/types/stream";
import { RoleInitializer } from "./RoleInitializer";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

async function openBillingPortal() {
  window.location.href = '/test';
}

type StartTimeFieldProps = { value: string; onChange: (value: string) => void };

export function StartTimeField({ value, onChange }: StartTimeFieldProps) {
  const initialDate = value ? new Date(value) : new Date();
  const panelRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<Date>(initialDate);
  const [hour, setHour] = useState<number>(() => { const h = initialDate.getHours(); return h % 12 || 12; });
  const [minute, setMinute] = useState<string>(() => String(initialDate.getMinutes()).padStart(2, "0"));
  const [ampm, setAmpm] = useState<"AM" | "PM">(initialDate.getHours() >= 12 ? "PM" : "AM");
  const [open, setOpen] = useState(false);

  const updateIso = (d: Date, h12: number, min: string, meridiem: "AM" | "PM") => {
    const cloned = new Date(d);
    cloned.setHours(meridiem === "PM" ? (h12 % 12) + 12 : h12 % 12);
    cloned.setMinutes(Number(min)); cloned.setSeconds(0); cloned.setMilliseconds(0);
    onChange(cloned.toISOString());
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!value) return;
    const d = new Date(value); const h = d.getHours();
    setDate(d); setHour(h % 12 || 12); setMinute(String(d.getMinutes()).padStart(2, "0")); setAmpm(h >= 12 ? "PM" : "AM");
  }, [value]);

  const displayText = `${format(date, "MMM dd, yyyy")} · ${format(
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), ampm === "PM" ? (hour % 12) + 12 : hour % 12, Number(minute)), "h:mm a"
  )}`;

  return (
    <div className="space-y-2 relative">
      <button type="button" onClick={() => setOpen((p) => !p)} className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left hover:border-neutral-400 bg-white">
        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-neutral-600" /><span className="text-sm text-neutral-900">{displayText}</span></div>
        <Clock className="h-4 w-4 text-neutral-500" />
      </button>
      {open && (
        <div className="mt-2 grid gap-4 rounded-2xl border bg-white p-4 shadow-xl sm:grid-cols-[1.4fr_1fr]" ref={panelRef}>
          <DayPicker mode="single" selected={date} onSelect={(d) => { if (!d) return; setDate(d); updateIso(d, hour, minute, ampm); }} weekStartsOn={0} />
          <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-neutral-900">Time (Phoenix Local Time)</div>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={12} value={hour} onChange={(e) => { const v = Math.min(12, Math.max(1, Number(e.target.value) || 1)); setHour(v); updateIso(date, v, minute, ampm); }} className="w-16 rounded-lg border px-2 py-1 text-center text-sm" />
              <span className="text-sm text-neutral-600">:</span>
              <input type="number" min={0} max={59} value={minute} onChange={(e) => { const v = Math.min(59, Math.max(0, Number(e.target.value))); const p = String(v).padStart(2, "0"); setMinute(p); updateIso(date, hour, p, ampm); }} className="w-16 rounded-lg border px-2 py-1 text-center text-sm" />
              <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 p-0.5 text-xs">
                <button type="button" onClick={() => { setAmpm("AM"); updateIso(date, hour, minute, "AM"); }} className={`px-2 py-1 rounded-full ${ampm === "AM" ? "bg-black text-white" : "text-neutral-700"}`}>AM</button>
                <button type="button" onClick={() => { setAmpm("PM"); updateIso(date, hour, minute, "PM"); }} className={`px-2 py-1 rounded-full ${ampm === "PM" ? "bg-black text-white" : "text-neutral-700"}`}>PM</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const useIsAdmin = () => {
  const { user } = useUser();
  return ((user?.unsafeMetadata?.role as string) ?? "viewer") === "admin";
};

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-sm border transition shadow-sm ${active ? "bg-black text-white border-black" : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"}`}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition ${className}`}>{children}</div>;
}

function computeStatus(startAt: string): StreamStatus {
  const now = new Date();
  const start = new Date(startAt);
  if (now < start) return "upcoming";
  if (now.getTime() - start.getTime() > 4 * 60 * 60 * 1000) return "past";
  return "live";
}

function StreamCard({ stream, layout = "grid" }: { stream: Stream; layout?: "grid" | "list" }) {
  const date = new Date(stream.startAt);
  const timeText = date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });

  const statusStyles: Record<StreamStatus, string> = {
    live: "bg-red-50 text-red-700 ring-1 ring-red-200",
    upcoming: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    past: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
  };

  return (
    <Card className={layout === "list" ? "flex overflow-hidden" : "overflow-hidden"}>
      <div className={layout === "list" ? "w-48 shrink-0" : "aspect-video w-full"}>
        <div className="relative h-full w-full bg-neutral-200">
          {stream.thumbnailUrl && <img src={stream.thumbnailUrl} alt={stream.title} className="h-full w-full object-cover" />}
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
            {stream.access !== "free" ? (
              <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200"><Ticket className="h-3 w-3 mr-1" />${stream.priceUSD?.toFixed(2) ?? "–"}</Badge>
            ) : (
              <Badge className="bg-sky-50 text-sky-700 ring-1 ring-sky-200"><Ticket className="h-3 w-3 mr-1" />Free</Badge>
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
          <a href={`/live/${stream.slug}`} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50" title="Open stream">
            {stream.status === "live" ? <Play className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} Open
          </a>
        </div>
        <div className="mt-2 text-sm text-neutral-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" /><span>{timeText}</span>
        </div>
      </div>
    </Card>
  );
}

type EmptyStateVariant = "live" | "upcoming" | "past";
function EmptyState({ variant }: { variant: EmptyStateVariant }) {
  const config = {
    live: { icon: Tv, title: "No live games right now", description: "When a game is live, it will appear here automatically. You can still browse upcoming games or replays below." },
    upcoming: { icon: Calendar, title: "No upcoming games yet", description: "Once new games are scheduled, they will show up here. Check back soon or follow your school for updates." },
    past: { icon: Clock, title: "No past games in your history", description: "Replays will appear here after games have ended. Watch live or upcoming games in the meantime." },
  }[variant];
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md shadow-neutral-300/60"><Icon className="h-6 w-6" /></div>
      <h3 className="text-lg font-semibold text-neutral-900">{config.title}</h3>
      <p className="mt-2 max-w-md mx-auto text-sm text-neutral-600">{config.description}</p>
    </div>
  );
}

export default function DashboardUI() {
  const isAdmin = useIsAdmin();
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StreamStatus | "all">("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [viewMode, setViewMode] = useState<"viewer" | "admin">("viewer");
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLeague, setFilterLeague] = useState<string>("all");
  const [filterAccess, setFilterAccess] = useState<"all" | "free" | "ppv" | "subscriber">("all");

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await apiFetch("/api/stream/my-streams", {}, getToken);
        if (!res.ok) { console.error("Failed to fetch streams:", res.status); setStreams([]); return; }
        const data = await res.json();
        if (data.streams && Array.isArray(data.streams)) { setStreams(data.streams); } else { setStreams([]); }
      } catch (err) { console.error("Error fetching streams:", err); setStreams([]); }
      finally { setLoading(false); }
    };
    fetchStreams();
  }, [getToken]);

  const allLeagues = useMemo(() => Array.from(new Set(streams.map((s) => s.league).filter(Boolean))).sort(), [streams]);

  const filtered = useMemo(() => {
    return streams
      .map((s) => ({ ...s, status: computeStatus(s.startAt) }))
      .filter((s) => (tab === "all" ? true : s.status === tab))
      .filter((s) => (filterLeague === "all" ? true : s.league === filterLeague))
      .filter((s) => (filterAccess === "all" ? true : s.access === filterAccess))
      .filter((s) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const hay = `${s.title} ${s.schoolA} ${s.schoolB} ${s.league}`.toLowerCase();
        return hay.includes(q);
      });
  }, [streams, query, tab, filterLeague, filterAccess]);

  const live = filtered.filter((s) => s.status === "live");
  const upcoming = filtered.filter((s) => s.status === "upcoming");
  const past = filtered.filter((s) => s.status === "past");

  return (
    <div className="min-h-screen bg-neutral-50">
      <RoleInitializer />
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight">VSS Live</h1>
              <p className="text-sm text-neutral-600">Welcome back! Browse your live and upcoming games.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teams, league, title..." className="w-72 rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black" />
              </div>
              <div className="hidden sm:flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <Pill active={tab === "all"} onClick={() => setTab("all")}>All</Pill>
                <Pill active={tab === "live"} onClick={() => setTab("live")}>Live</Pill>
                <Pill active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</Pill>
                <Pill active={tab === "past"} onClick={() => setTab("past")}>Past</Pill>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <button onClick={() => { setLayout("grid"); setViewMode("viewer"); }} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${viewMode === "viewer" && layout === "grid" ? "bg-black text-white" : "hover:bg-neutral-50"}`} title="Grid"><Columns className="h-4 w-4" />Grid</button>
                <button onClick={() => { setLayout("list"); setViewMode("viewer"); }} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${viewMode === "viewer" && layout === "list" ? "bg-black text-white" : "hover:bg-neutral-50"}`} title="List"><Rows className="h-4 w-4" />List</button>
                {isAdmin && (
                  <button onClick={() => setViewMode("admin")} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${viewMode === "admin" ? "bg-black text-white" : "hover:bg-neutral-50 text-neutral-700"}`} title="Admin tools"><UserCog className="h-4 w-4" />Admin</button>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <UserButton appearance={{ elements: { avatarImage: "rounded-full border-2 border-violet-600" } }}>
                <UserButton.MenuItems>
                  <UserButton.Action label="Subscription" labelIcon={<DotIcon />} onClick={openBillingPortal} />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {viewMode === "admin" && isAdmin && (
          <AdminPanel onCreated={(s) => setStreams((prev) => [s, ...prev])} getToken={getToken} />
        )}

        {viewMode === "viewer" && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-black" />
              </div>
            )}
            {!loading && (
              <>
                {(tab === "all" || tab === "live") && (
                  <section className="mb-8">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Live now</h2>
                      <button onClick={() => setTab("live")} className="text-sm text-neutral-700 hover:underline">View all</button>
                    </div>
                    {live.length === 0 ? <EmptyState variant="live" /> : (
                      <div className={layout === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
                        {live.map((s) => <StreamCard key={s.id} stream={s} layout={layout} />)}
                      </div>
                    )}
                  </section>
                )}

                {(tab === "all" || tab === "upcoming") && (
                  <section className="mb-8">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Upcoming</h2>
                      <div className="relative">
                        <button onClick={() => setShowFilters((v) => !v)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${showFilters || filterLeague !== "all" || filterAccess !== "all" ? "border-black bg-black text-white" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
                          <FilterIcon className="h-4 w-4" /> Filters
                          {(filterLeague !== "all" || filterAccess !== "all") && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">{(filterLeague !== "all" ? 1 : 0) + (filterAccess !== "all" ? 1 : 0)}</span>}
                        </button>
                        {showFilters && (
                          <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">League</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {["all", ...allLeagues].map((l) => (
                                <button key={l} onClick={() => setFilterLeague(l)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filterLeague === l ? "border-black bg-black text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"}`}>{l === "all" ? "All" : l}</button>
                              ))}
                            </div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Access</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {(["all", "free", "ppv", "subscriber"] as const).map((a) => (
                                <button key={a} onClick={() => setFilterAccess(a)} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition capitalize ${filterAccess === a ? "border-black bg-black text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"}`}>{a === "all" ? "All" : a === "ppv" ? "PPV" : a.charAt(0).toUpperCase() + a.slice(1)}</button>
                              ))}
                            </div>
                            <button onClick={() => { setFilterLeague("all"); setFilterAccess("all"); }} className="w-full rounded-full border border-neutral-200 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50">Clear filters</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {upcoming.length === 0 ? <EmptyState variant="upcoming" /> : (
                      <div className={layout === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
                        {upcoming.map((s) => <StreamCard key={s.id} stream={s} layout={layout} />)}
                      </div>
                    )}
                  </section>
                )}

                {(tab === "all" || tab === "past") && (
                  <section className="mb-8">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Past Games</h2>
                      <button onClick={() => setTab("past")} className="text-sm text-neutral-700 hover:underline">Browse replays</button>
                    </div>
                    {past.length === 0 ? <EmptyState variant="past" /> : (
                      <div className={layout === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
                        {past.map((s) => <StreamCard key={s.id} stream={s} layout={layout} />)}
                      </div>
                    )}
                  </section>
                )}

                <div className="mt-12 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100"><Radio className="h-5 w-5 text-neutral-600" /></div>
                  <h3 className="text-lg font-semibold">Looking for a specific matchup?</h3>
                  <p className="mt-1 text-sm text-neutral-600">Use the search above or go to the full schedule to find your team.</p>
                  <div className="mt-4 inline-flex gap-2">
                    <a href="https://varsitysportsshow.com/schedule" target="_blank" rel="noopener noreferrer" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Full schedule</a>
                    <a href="/test" className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">Subscription plans</a>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AdminPanel({ onCreated, getToken }: { onCreated: (s: Stream) => void; getToken: () => Promise<string | null> }) {
  const [title, setTitle] = useState("");
  const [league, setLeague] = useState("");
  const [schoolA, setSchoolA] = useState("");
  const [schoolB, setSchoolB] = useState("");
  const [startAt, setStartAt] = useState(() => { const now = new Date(); now.setMinutes(now.getMinutes() + 30); return now.toISOString(); });
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  type FormAccessType = "" | "free" | "ppv" | "subscriber";
  const [access, setAccess] = useState<FormAccessType>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FormAccessType | "blank";
    if (value === "blank") { setAccess(""); return; }
    setAccess(value);
  };

  const toSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async () => {
    const requiredFields = [
      { value: title, name: "Title" }, { value: league, name: "League" },
      { value: schoolA, name: "Home / School A" }, { value: schoolB, name: "Away / School B" },
      { value: startAt, name: "Start Time" }, { value: access, name: "Access" },
      { value: thumbnail, name: "Thumbnail URL" }, { value: sourceUrl, name: "Stream Source" },
    ];
    for (const field of requiredFields) { if (!field.value || field.value.toString().trim() === "") { alert(`${field.name} is required`); return; } }
    if (access === "ppv" && (!price || Number(price) <= 0)) { alert("Price is required when access = Pay-per-view"); return; }

    try {
      setSubmitting(true); setError("");
      const slug = toSlug(`${schoolA}-${schoolB}-${title}`);
      const res = await apiFetch("/api/admin/events", {
        method: "POST",
        body: JSON.stringify({
          title, slug, league, schoolA, schoolB,
          access: access as string,
          priceUSD: access === "ppv" ? Number(price) : undefined,
          requiredSubscription: access === "subscriber" ? "premium" : "basic",
          thumbnailUrl: thumbnail,
          dacastIframeSrc: sourceUrl,
          scheduledStart: new Date(startAt).toISOString(),
        }),
      }, getToken);

      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error || `Failed (${res.status})`); return; }
      const data = await res.json();
      onCreated(data.stream as Stream);
      alert("Stream created!");
      setTitle(""); setLeague(""); setSchoolA(""); setSchoolB(""); setPrice(""); setThumbnail(""); setSourceUrl(""); setAccess("");
    } catch (err: any) { setError(err.message || "Network error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Create Livestream</h2>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 mb-4">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><div className="text-sm font-medium mb-1">Game Title</div><div className="relative"><input required className="w-full border rounded-lg px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wolves vs Tigers" /><button type="button" onClick={() => setTitle("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>
        <label><div className="text-sm font-medium mb-1">League</div><div className="relative"><input required className="w-full border rounded-lg px-3 py-2" value={league} onChange={(e) => setLeague(e.target.value)} placeholder="HS Football" /><button type="button" onClick={() => setLeague("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>
        <label><div className="text-sm font-medium mb-1">Home / School A</div><div className="relative"><input required className="w-full border rounded-lg px-3 py-2" value={schoolA} onChange={(e) => setSchoolA(e.target.value)} placeholder="Desert Ridge" /><button type="button" onClick={() => setSchoolA("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>
        <label><div className="text-sm font-medium mb-1">Away / School B</div><div className="relative"><input required className="w-full border rounded-lg px-3 py-2" value={schoolB} onChange={(e) => setSchoolB(e.target.value)} placeholder="Mesa East" /><button type="button" onClick={() => setSchoolB("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>
        <label><div className="text-sm font-medium mb-1">Start Time</div><StartTimeField value={startAt} onChange={(iso) => setStartAt(iso)} /></label>
        <label><div className="text-sm font-medium mb-1">Access</div><select className="w-full border rounded-lg px-3 py-2" value={access} onChange={handleAccessChange} required><option value="" disabled hidden>Select access type...</option><option value="blank"> </option><option value="free">Free</option><option value="ppv">Pay-per-view</option><option value="subscriber">Subscriber only</option></select></label>
        {access === "ppv" && (<label><div className="text-sm font-medium mb-1">Price</div><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center font-bold text-gray-500">$</span><input required min="0" step="0.01" className="w-full border rounded-lg px-3 py-2 pl-8 pr-10" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" /><button type="button" onClick={() => setPrice("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>)}
        <label className="sm:col-span-2"><div className="text-sm font-medium mb-1">Thumbnail URL</div><div className="relative"><input required className="w-full border rounded-lg px-3 py-2" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://images.unsplash.com/..." /><button type="button" onClick={() => setThumbnail("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div>{thumbnail && (<div className="mt-3"><p className="text-xs text-gray-500 mb-1">Thumbnail Preview:</p><img src={thumbnail} alt="Thumbnail preview" className="w-48 h-28 object-cover rounded border" onError={(e) => { e.currentTarget.src = ""; }} /></div>)}</label>
        <label className="sm:col-span-2"><div className="text-sm font-medium mb-1">Stream Source (Dacast iframe URL)</div><div className="relative"><input className="w-full border rounded-lg px-3 py-2" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://iframe.dacast.com/live/..." /><button type="button" onClick={() => setSourceUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"><Trash2 size={16} /></button></div></label>
      </div>
      <button onClick={handleCreate} disabled={submitting} className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50">{submitting ? "Creating..." : "Create livestream"}</button>
    </div>
  );
}