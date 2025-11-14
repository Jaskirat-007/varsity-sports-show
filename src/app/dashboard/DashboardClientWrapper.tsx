// src/app/dashboard/DashboardClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
});

export default function DashboardClientWrapper() {
  return <DashboardClient />;
}
