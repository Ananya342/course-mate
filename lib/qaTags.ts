const MAX_TAGS = 12;
const MAX_TAG_LEN = 40;

/** Normalize a single tag: lowercase, alphanumerics + hyphen */
function normalizeOne(raw: string): string | null {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!t || t.length > MAX_TAG_LEN) return null;
  return t;
}

/**
 * Parse comma- or space-separated tags from user input.
 */
export function parseTagsInput(input: string): string[] {
  if (!input.trim()) return [];
  const parts = input.split(/[,]+|\s{2,}/).flatMap((p) => p.split(/\s+/));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const n = normalizeOne(p);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

export const SUGGESTED_QA_TAGS = [
  "homework",
  "project",
  "exam",
  "hackathon",
  "competition",
  "lab",
  "lecture",
  "midterm",
  "final",
  "group-work",
] as const;

export function postMatchesSearch(
  post: { title: string; body: string; tags?: string[] },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (post.title.toLowerCase().includes(q) || post.body.toLowerCase().includes(q)) {
    return true;
  }
  const tags = post.tags ?? [];
  return tags.some((t) => t.includes(q) || t.replace(/-/g, " ").includes(q));
}
