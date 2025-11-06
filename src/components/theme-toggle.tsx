"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Props = { className?: string; };

export function ThemeToggle({ className = "" }: Props) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === "system" ? systemTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={[
        // Outer Capsule
        "relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full",
        "transition-colors select-none",
        // Color: On = Purple; Off = Gray
        isDark ? "bg-[#6c47ff]" : "bg-gray-300",
        // Border/Focus (Do not turn black)
        "border border-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6c47ff]",
        "active:scale-[0.98]",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-flex h-7 w-7 items-center justify-center",
          "rounded-full bg-white shadow-md transition-transform",
          isDark ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      >
        <span className="text-[13px]">{isDark ? "🌙" : "☀️"}</span>
      </span>
    </button>
  );
}
