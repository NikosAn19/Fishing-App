/** Adventure scheduler step identifiers */
export enum AdventureScheduleStep {
  LOCATION = 1,
  DATE = 2,
  DETAILS = 3,
  FORECAST = 4,
}

/** Adventure scheduler step configuration */
export const ADVENTURE_SCHEDULE_STEPS = [
  {
    id: AdventureScheduleStep.LOCATION,
    title: "Select Location",
    subtitle: "Choose your fishing spot on the map",
  },
  {
    id: AdventureScheduleStep.DATE,
    title: "Pick Date",
    subtitle: "When do you want to go fishing?",
  },
  {
    id: AdventureScheduleStep.DETAILS,
    title: "Fishing Details",
    subtitle: "Add technique and gear info (optional)",
  },
  {
    id: AdventureScheduleStep.FORECAST,
    title: "Forecast",
    subtitle: "View weather forecast for your adventure",
  },
] as const;
