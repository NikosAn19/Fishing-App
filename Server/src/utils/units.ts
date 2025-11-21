import { MPS_TO_KNOTS } from "./conversions";

export function msToKnots(ms: number | null): number | null {
  if (ms === null || ms === undefined) return null;
  return ms * MPS_TO_KNOTS; // Convert m/s to knots
}

export function degToCardinal(deg: number | null): string | null {
  if (deg === null || deg === undefined) return null;

  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || null;
}

export function degToCardinalGreek(deg: number | null): string | null {
  if (deg === null || deg === undefined) return null;

  const directions = [
    "Β", // N - Βόρεια
    "ΒΒΑ", // NNE - Βορειοβορειοανατολικά
    "ΒΑ", // NE - Βορειοανατολικά
    "ΑΒΑ", // ENE - Ανατολοβορειοανατολικά
    "Α", // E - Ανατολικά
    "ΑΝΑ", // ESE - Ανατολονοτιοανατολικά
    "ΝΑ", // SE - Νοτιοανατολικά
    "ΝΝΑ", // SSE - Νοτιονοτιοανατολικά
    "Ν", // S - Νότια
    "ΝΝΔ", // SSW - Νοτιονοτιοδυτικά
    "ΝΔ", // SW - Νοτιοδυτικά
    "ΔΝΔ", // WSW - Δυτικονοτιοδυτικά
    "Δ", // W - Δυτικά
    "ΔΒΔ", // WNW - Δυτικοβορειοδυτικά
    "ΒΔ", // NW - Βορειοδυτικά
    "ΒΒΔ", // NNW - Βορειοβορειοδυτικά
  ];

  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || null;
}
