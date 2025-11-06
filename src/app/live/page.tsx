'use client';

export default function LivePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold mb-6">Live Stream</h1>

      <div className="w-full max-w-4xl aspect-video border rounded-xl overflow-hidden">
        <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
        />

      </div>
    </main>
  );
}
