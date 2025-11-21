/**
 * Map English weather condition icon keys to Greek display names
 */
export function getWeatherConditionInGreek(iconKey: string): string {
  switch (iconKey) {
    case "Sunny":
      return "Ηλιόλουστος";
    case "Partly Cloudy":
      return "Αραιή Συννεφιά";
    case "Cloudy":
      return "Συννεφιασμένος";
    case "Rainy":
      return "Βροχερός";
    case "Drizzle":
      return "Ψιλόβροχο";
    case "Thunderstorm":
      return "Καταιγίδα";
    case "Snow":
      return "Χιονώδης";
    case "Mist":
      return "Ομίχλη";
    default:
      return "Συννεφιασμένος";
  }
}
