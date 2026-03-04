"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LiveListPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Live Games</h1>
        <p className="mt-2 text-neutral-600">All live games are currently listed on your main dashboard.</p>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-neutral-800">
          <ArrowLeft className="h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
