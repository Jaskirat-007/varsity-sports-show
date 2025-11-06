// src/app/api/protected/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await currentUser();
  return Response.json({
    ok: true,
    userId,
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.username || "User",
  });
}
