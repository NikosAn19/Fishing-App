/** Convert knots to Beaufort (0–12) */
export function knotsToBeaufort(kn: number): number {
    const n = Math.max(0, kn);
    if (n < 1) return 0;
    if (n <= 3) return 1;
    if (n <= 6) return 2;
    if (n <= 10) return 3;
    if (n <= 16) return 4;
    if (n <= 21) return 5;
    if (n <= 27) return 6;
    if (n <= 33) return 7;
    if (n <= 40) return 8;
    if (n <= 47) return 9;
    if (n <= 55) return 10;
    if (n <= 63) return 11;
    return 12;
  }
  
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
    const range = v.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*(k[n|t])?/i);
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
  