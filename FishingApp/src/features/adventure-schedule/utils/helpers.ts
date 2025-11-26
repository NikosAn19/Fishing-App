import { colors } from "../../../theme/colors";
import { QuickDateStatus } from "../types/quickDateTypes";

export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function startOfMonth(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return normalizeDate(result);
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return normalizeDate(result);
}

export function isSameDay(a: Date, b: Date): boolean {
  const first = normalizeDate(a);
  const second = normalizeDate(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameDayISO(date: Date, isoDateString: string): boolean {
  if (!isoDateString) return false;
  const parsed = new Date(`${isoDateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return isSameDay(date, parsed);
}

export function isWithinRange(
  date: Date,
  range: { min: Date; max: Date }
): boolean {
  const value = normalizeDate(date).getTime();
  const min = normalizeDate(range.min).getTime();
  const max = normalizeDate(range.max).getTime();

  return value >= min && value <= max;
}

export function isSelectableDate(
  date: Date,
  range: { min: Date; max: Date }
): boolean {
  return isWithinRange(date, range);
}

export function isTodayDate(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isTomorrowDate(date: Date): boolean {
  return isSameDay(date, addDays(new Date(), 1));
}

export function getQuickDateStatus(dateString: string): QuickDateStatus | null {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  if (isTodayDate(date)) {
    return { label: "Today", color: colors.accent };
  }

  if (isTomorrowDate(date)) {
    return { label: "Tomorrow", color: "#FF9F7A" };
  }

  return null;
}

export function formatFriendlyDate(
  dateString: string,
  locale = "en-US"
): string {
  if (!dateString) return "";
  const status = getQuickDateStatus(dateString);
  if (status) {
    return status.label;
  }

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatLongDate(dateString: string, locale = "el-GR"): string {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMonthYear(date: Date, locale = "en-US"): string {
  return startOfMonth(date).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

export function buildMonthMatrix(month: Date): (Date | null)[] {
  const base = startOfMonth(month);
  const year = base.getFullYear();
  const monthIndex = base.getMonth();

  const lastDay = new Date(year, monthIndex + 1, 0);
  lastDay.setHours(0, 0, 0, 0);
  const totalDays = lastDay.getDate();
  const startingWeekday = base.getDay(); // 0 = Sunday

  const days: (Date | null)[] = [];

  for (let i = 0; i < startingWeekday; i++) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const current = new Date(year, monthIndex, day);
    current.setHours(0, 0, 0, 0);
    days.push(current);
  }

  return days;
}

export function formatDateForApi(date: Date): string {
  const normalized = normalizeDate(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatIsoTime(isoTime: string, locale = "el-GR"): string {
  if (!isoTime) return "—";
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
