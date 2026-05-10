import type { Citation } from "./types";

// Parses citations out of raw SSE event JSON accumulated during streaming.
// web_search_20250305 returns tool_result blocks with url/title per result.
export function parseCitationsFromEvents(eventBuffer: string[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];
  let index = 1;

  for (const raw of eventBuffer) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    collectUrlsFromValue(parsed, seen, citations, index);
    index = citations.length + 1;
  }

  return citations;
}

function collectUrlsFromValue(
  value: unknown,
  seen: Set<string>,
  out: Citation[],
  nextIndex: number
) {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    for (const item of value) collectUrlsFromValue(item, seen, out, out.length + 1);
    return;
  }

  const obj = value as Record<string, unknown>;

  // web_search_tool_result entries have url + title at the same level
  if (typeof obj.url === "string" && !seen.has(obj.url)) {
    seen.add(obj.url);
    out.push({
      index: out.length + 1,
      url: obj.url,
      title: typeof obj.title === "string" ? obj.title : obj.url,
    });
    return;
  }

  for (const v of Object.values(obj)) {
    collectUrlsFromValue(v, seen, out, out.length + 1);
  }
}
