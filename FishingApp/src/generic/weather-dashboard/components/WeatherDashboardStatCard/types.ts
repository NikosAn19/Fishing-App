import React from "react";

export interface WeatherDashboardStatCardProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBgColor?: string;
  label: string;
  value: string | React.ReactNode;
  subText?: string | React.ReactNode;
  valueStyle?: "default" | "moon" | "sea";
}
