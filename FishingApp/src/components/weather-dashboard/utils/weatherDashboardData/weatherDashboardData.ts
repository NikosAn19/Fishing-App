import { calculateBeaufort } from "../weatherCalculations/weatherCalculations";

/**
 * @deprecated Use calculateBeaufort from weatherCalculations.ts instead
 * This function is kept for backward compatibility but uses the new calculation function
 */
export function getBeaufort(knots: number) {
  const result = calculateBeaufort(knots);
  return { force: result.force, desc: result.description };
}

export function generateDayData(offset: number) {
  const days = ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"];
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const isToday = offset === 0;

  const conditionIndex = offset % 4;
  let condition = "Αραιή Συννεφιά";
  let iconKey = "Partly Cloudy";

  if (conditionIndex === 1) {
    condition = "Ηλιόλουστος";
    iconKey = "Sunny";
  }
  if (conditionIndex === 2) {
    condition = "Βροχερός";
    iconKey = "Rainy";
  }
  if (conditionIndex === 3) {
    condition = "Καταιγίδα";
    iconKey = "Stormy";
  }

  return {
    id: offset,
    dayName: isToday ? "Σήμερα" : days[date.getDay()],
    date: `${date.getDate()} / ${date.getMonth() + 1}`,
    temp: 22 + offset * 1 * (offset % 2 === 0 ? 1 : -1),
    high: 26 + offset,
    low: 18 + offset,
    condition: condition,
    iconKey: iconKey,
    score: Math.max(40, 89 - offset * 8),
    hourly: Array.from({ length: 6 }).map((_, i) => ({
      time: `${i * 2 + 10}:00`,
      temp: 23 + Math.floor(Math.random() * 3),
      weather: ["Sunny", "Cloudy", "Rainy"][Math.floor(Math.random() * 3)],
    })),
    pressure: 1013 + offset * 2,
    moonPhase: "Αύξων Αμφίκυρτος",
    moonIllumination: 82 - offset * 5,
    windSpeed: 12 + offset,
    windDir: "ΒΔ",
    seaTemp: 20 + offset * 0.5,
    sunrise: "06:30",
    sunset: "20:15",
  };
}
