// Const Import -> NOT CHANGE
import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Non Login Page -> Edit if needed
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/favicon.ico",

  "/_next/static(.*)",
  "/_next/image(.*)",
  "/images(.*)",      // <-- if you put files under /public/images
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",     // /admin, /admin/dashboard
  "/api/admin(.*)", // /api/admin/update-schedule
]);

// clerkMiddleware
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

// config
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
