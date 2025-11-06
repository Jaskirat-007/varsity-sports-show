// components/SegmentedAuth.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SegmentedAuth() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 先回傳一個與實際按鈕同高度/外觀的 placeholder，避免 Hydration 差異與版面跳動
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="inline-flex items-center rounded-full h-10 p-1 bg-gray-200 dark:bg-[#6c47ff] shadow-sm"
        style={{ width: 232 }} // 依你目前按鈕寬度調整
      />
    );
  }

  return (
    <div
      role="group"
      aria-label="Authentication"
      className="
        inline-flex items-center
        rounded-full h-10 p-1 select-none transition-colors shadow-sm
        bg-gray-200 text-gray-900
        dark:bg-[#6c47ff] dark:text-white
      "
    >
    <Link
      href="/sign-in"
      className="
          px-4 h-8 flex items-center justify-center
          rounded-l-full text-sm font-medium transition-colors
          hover:bg-gray-300 active:bg-gray-400
          dark:hover:bg:white/15 dark:active:bg-white/20
      "
    >
      Sign In
    </Link>

    <span aria-hidden className="mx-1 h-6 w-px bg-gray-400 dark:bg-white/35" />

    <Link
      href="/sign-up"
      className="
          px-4 h-8 flex items-center justify-center
          rounded-r-full text-sm font-medium transition-colors
          hover:bg-gray-300 active:bg-gray-400
          dark:hover:bg:white/15 dark:active:bg-white/20
      "
    >
      Sign Up
    </Link>
    </div>
  );
}
