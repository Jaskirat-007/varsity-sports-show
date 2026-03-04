import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClientWrapper from "./DashboardClientWrapper";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in?redirect_url=/dashboard");
  }

  return <DashboardClientWrapper />;
}