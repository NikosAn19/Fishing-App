import React from "react";

/** Status item used in MainCard and StatusRow */
export interface StatusItem {
  icon: React.ComponentType<{ size: number; color: string }>;
  text: string;
  isActive?: boolean;
  iconColor?: string;
}

/** Stat item used in StatsGrid (same as StatCard props) */
export interface StatItem {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBgColor?: string;
  label: string;
  value: string | React.ReactNode;
  subText?: string | React.ReactNode;
  valueStyle?: "default" | "moon" | "sea";
}
