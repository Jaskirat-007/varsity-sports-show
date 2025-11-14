// src/lib/slug.ts

// Transform the string into a clean slug segment, for example, "Wolves vs Tigers!!" → "wolves-vs-tigers"
export function slugifyBase(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")          // Remove quotation marks
    .replace(/[^a-z0-9]+/g, "-")   // Non-English numbers become -
    .replace(/^-+|-+$/g, "")       // Head and tail - Remove
    .replace(/-{2,}/g, "-");       // Multiple - compressed into one
}

// Logic for generating slugs for streams
export function makeStreamSlug(
  title: string,
  startAtIso: string,
  schoolA?: string,
  schoolB?: string,
) {
  const baseTitle =
    title && title.trim().length > 0
      ? title
      : schoolA && schoolB
      ? `${schoolA} vs ${schoolB}`
      : "stream";

  const start = new Date(startAtIso);
  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");
  const hh = String(start.getHours()).padStart(2, "0");
  const min = String(start.getMinutes()).padStart(2, "0");

  const base = slugifyBase(baseTitle);
  const datePart = `${yyyy}-${mm}-${dd}-${hh}${min}`;

  return `${base}-${datePart}`;
}
