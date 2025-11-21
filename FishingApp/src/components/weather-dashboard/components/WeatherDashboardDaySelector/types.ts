export interface Day {
  id: number | string;
  dayName: string;
  date: string;
}

export interface WeatherDashboardDaySelectorProps {
  days: Day[];
  selectedIndex: number;
  onDaySelect: (index: number) => void;
}
