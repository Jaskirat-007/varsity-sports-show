"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Info } from "lucide-react";

export default function VideoPlayerPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("videoUrl");

  if (!videoUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Video not found</h1>
          <p className="mt-2 text-neutral-600">The video URL is missing or invalid.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 text-black hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header / Back Button */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="text-xs text-neutral-500 font-mono hidden sm:block truncate max-w-xs">
          {videoUrl.split('?')[0]}
        </div>
      </header>

      {/* Player Area */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="h-full w-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Info Area */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Replay: Game Session</h1>
              <p className="mt-2 text-neutral-400 leading-relaxed">
                Watch the full replay of the game. You can use the player controls above to seek, pause, and adjust the volume.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Type</span>
                </div>
                <div className="text-sm font-medium">Full Replay</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Source</span>
                </div>
                <div className="text-sm font-medium uppercase tracking-tight">VSS Storage</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Info className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                </div>
                <div className="text-sm font-medium text-emerald-400">Archived</div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 h-fit">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/replays" className="block text-sm text-neutral-300 hover:text-white">All Replays</Link>
              <Link href="/dashboard" className="block text-sm text-neutral-300 hover:text-white">Live Games</Link>
              <a href="https://varsitysportsshow.com/schedule" target="_blank" className="block text-sm text-neutral-300 hover:text-white">Season Schedule</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
