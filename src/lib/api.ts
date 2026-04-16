// src/lib/api.ts
// Centralized API client for calling the .NET backend with Clerk auth tokens.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5150";

/**
 * Fetches from the .NET backend with an optional Clerk auth token.
 * Use for all backend API calls.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (getToken) {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });
}