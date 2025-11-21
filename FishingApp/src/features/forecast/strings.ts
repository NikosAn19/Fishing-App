/** Localized strings for forecast feature (Greek) */
export const FORECAST_STRINGS = {
  conditions: "Συνθήκες Ψαρέματος",
  bestTimes: "Καλύτερες Ώρες",
  moonPhase: "Φάση σελήνης",
  sunrise: "Ανατολή ηλίου",
  sunset: "Δύση",
  sunriseLabel: "Ανατολή",
  sunsetLabel: "Δύση",
  wind: "Άνεμος",
  waves: "Κύμα",
  airTemp: "Θερμ. αέρα",
  waterTemp: "Θερμ. νερού",
  clouds: "Νεφοκάλυψη",
  pressure: "Πίεση",
  breakdown: {
    wind: "Άνεμος",
    waves: "Κύμα",
    clouds: "Νέφη",
    pressure: "Πίεση",
    moon: "Σελήνη",
    temp: "Θερμ.",
    swell: "Swell",
  },
  recommendations: {
    technique: "Τεχνική",
    bait: "Δόλωμα",
  },
  fallbackBestTimes: [
    { label: "06:00–08:00", icon: "sunny-outline" },
    { label: "18:30–19:45", icon: "moon-outline" },
  ],
} as const;
