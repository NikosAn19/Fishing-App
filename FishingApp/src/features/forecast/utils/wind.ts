/**
 * Parse wind strings (kept for potential user input parsing).
 * Note: knotsToBeaufort has been moved to backend (Server/src/utils/formatters.ts)
 */
export type ParsedWind = {
  direction?: string; // e.g. "ΒΑ"
  minKn?: number;
  maxKn?: number;
  singleKn?: number;
};

/** Parse strings like "ΒΑ 9–14 kn", "9-14 kt", "12 kn", "ΒΔ 6 kt" */
export function parseWindKnots(value: string): ParsedWind {
  const v = (value || "").trim();

  // range first (supports hyphen or en-dash)
  const range = v.match(
    /(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*(k[n|t])?/i
  );
  if (range) {
    const minKn = parseFloat(range[1]);
    const maxKn = parseFloat(range[2]);
    const dir = v.replace(range[0], "").trim() || undefined;
    return { direction: dir, minKn, maxKn };
  }

  // single speed
  const single = v.match(/(\d+(?:\.\d+)?)\s*(k[n|t])?/i);
  if (single) {
    const singleKn = parseFloat(single[1]);
    const dir = v.replace(single[0], "").trim() || undefined;
    return { direction: dir, singleKn };
  }

  return { direction: v };
}
