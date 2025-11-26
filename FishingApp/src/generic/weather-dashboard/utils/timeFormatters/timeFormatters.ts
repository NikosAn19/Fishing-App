import { DEFAULT_TIMEZONE } from "../../../../config/time";
import { UnifiedForecast } from "../../../../features/forecast/types/forecastApiTypes";
import { DaySelectorDaysResult } from "./types";

/**
 * Convert ISO string to HH:mm format
 */
export function formatTimeISO(
  iso: string | null | undefined,
  tz?: string
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  try {
    const formatted = new Intl.DateTimeFormat("el-GR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz || DEFAULT_TIMEZONE,
    }).format(d);
    return formatted || "—";
  } catch {
    try {
      const formatted = d.toLocaleTimeString("el-GR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return formatted || "—";
    } catch {
      return "—";
    }
  }
}

/**
 * Convert date to day name ("Σήμερα" or day abbreviation)
 */
export function formatDateToDayName(date: string | Date): string {
  const days = ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"];
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(d);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return "Σήμερα";
  }
  return days[d.getDay()] || "—";
}

/**
 * Generate array of 7 days (today + 6 future days) for day selector
 */
export function getDaySelectorDays(
  forecast: UnifiedForecast
): DaySelectorDaysResult {
  const days: DaySelectorDaysResult = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayName = formatDateToDayName(date);
    const dateStr = `${date.getDate()} / ${date.getMonth() + 1}`;

    days.push({
      id: i,
      dayName,
      date: dateStr,
    });
  }

  return days;
}
