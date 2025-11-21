export function moonPhaseFraction(date: Date): {
  fraction: number;
  label: string;
} {
  // Simplified moon phase calculation
  // This is a basic approximation - for production use a proper astronomical library

  const knownNewMoon = new Date("2024-01-11T11:57:00Z"); // Known new moon date
  const lunarCycle = 29.53059; // Average lunar cycle in days

  const daysSinceNewMoon =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cyclePosition =
    ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

  const fraction = cyclePosition / lunarCycle;

  let label: string;
  if (fraction < 0.125) label = "New Moon";
  else if (fraction < 0.375) label = "Waxing Crescent";
  else if (fraction < 0.625) label = "Full Moon";
  else label = "Waning Crescent";

  return { fraction, label };
}


















