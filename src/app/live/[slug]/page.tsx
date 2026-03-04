// src/app/live/[slug]/page.tsx
// Design UI: TODO implement the real iframe

type LivePageProps = {
  params: { slug: string };
};

// This is a simple mock stream; you can replace it when you need to connect real data.
const MOCK_STREAM = {
  title: "Wolves vs Tigers",
  league: "HS Football",
  schoolA: "Desert Ridge",
  schoolB: "Mesa East",
  startAt: new Date().toISOString(),
  status: "live" as const,
  access: "ppv",
  priceUSD: 3.99 as number | null,
};

export default function LivePage({ params }: LivePageProps) {
  const { slug } = params;
  const stream = MOCK_STREAM;

  const startTime = new Date(stream.startAt);
  const dateText = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const statusLabel =
    stream.status === "live"
      ? "Live now"
      : stream.status === "upcoming"
      ? "Scheduled"
      : "Replay";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* This displays the current slug for your testing convenience. */}
      <p className="text-xs text-neutral-500">
        Testing Livestream UI Page <span className="font-mono">{slug}</span>
      </p>

      {/* Header */}
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span
            className={`h-2 w-2 rounded-full ${
              stream.status === "live" ? "bg-red-500 animate-pulse" : "bg-neutral-400"
            }`}
          />
          {statusLabel}
        </p>

        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
          {stream.title}
        </h1>

        <p className="text-sm text-neutral-600">
          {stream.schoolA} vs {stream.schoolB} · {stream.league}
        </p>

        <p className="text-xs text-neutral-500">{dateText}</p>
      </header>

      {/* Player section (currently using a fake UI) */}
      <section className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl flex items-center justify-center">
        <iframe 
        id="80cea297-81e0-24ec-924b-772c26b87f56-live-a2edb7a8-c226-4478-861f-539a00109990" 
        src="https://iframe.dacast.com/live/80cea297-81e0-24ec-924b-772c26b87f56/a2edb7a8-c226-4478-861f-539a00109990" 
        width="100%" 
        height="100%" 
        scrolling="no" 
        allow="autoplay; encrypted-media"
        allowFullScreen
        ></iframe>
      </section>

      {/* Information section below */}
      <section className="grid gap-4 sm:grid-cols-3 text-sm text-neutral-700">
        <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Access
            </h2>
            <p>
            {stream.access === "free" && "Free to watch"}

            {stream.access === "ppv" &&
                `Pay-per-view · $${stream.priceUSD?.toFixed(2) ?? "-"}`}

            {stream.access === "subscriber" && "Subscribers only"}
            </p>
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Matchup
          </h2>
          <p>
            <span className="font-medium">{stream.schoolA}</span> vs{" "}
            <span className="font-medium">{stream.schoolB}</span>
          </p>
          <p className="text-xs text-neutral-500">{stream.league}</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Kickoff time
          </h2>
          <p>{dateText}</p>
        </div>
      </section>
    </main>
  );
}
