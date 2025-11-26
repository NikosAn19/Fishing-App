/** Constants and enums for Greek weather descriptions */

/** Beaufort Force Scale (0-12) */
export enum BeaufortForce {
  CALM = 0,
  LIGHT_AIR = 1,
  LIGHT_BREEZE = 2,
  GENTLE_BREEZE = 3,
  MODERATE_BREEZE = 4,
  FRESH_BREEZE = 5,
  STRONG_BREEZE = 6,
  NEAR_GALE = 7,
  GALE = 8,
  STRONG_GALE = 9,
  STORM = 10,
  VIOLENT_STORM = 11,
  HURRICANE = 12,
}

/** Beaufort scale descriptions in Greek */
export const BEAUFORT_DESCRIPTIONS: Record<BeaufortForce, string> = {
  [BeaufortForce.CALM]: "Άπνοια",
  [BeaufortForce.LIGHT_AIR]: "Σχεδόν Άπνοια",
  [BeaufortForce.LIGHT_BREEZE]: "Πολύ Ασθενής",
  [BeaufortForce.GENTLE_BREEZE]: "Ασθενής",
  [BeaufortForce.MODERATE_BREEZE]: "Μέτριος",
  [BeaufortForce.FRESH_BREEZE]: "Λαμπρός",
  [BeaufortForce.STRONG_BREEZE]: "Ισχυρός",
  [BeaufortForce.NEAR_GALE]: "Σφοδρός",
  [BeaufortForce.GALE]: "Θύελλα",
  [BeaufortForce.STRONG_GALE]: "Ισχυρή Θύελλα",
  [BeaufortForce.STORM]: "Καταιγίδα",
  [BeaufortForce.VIOLENT_STORM]: "Βίαια Καταιγίδα",
  [BeaufortForce.HURRICANE]: "Τυφώνας",
};

/** Wind Status Categories */
export enum WindStatus {
  CALM = "CALM",
  LIGHT = "LIGHT",
  MODERATE = "MODERATE",
  STRONG = "STRONG",
}

/** Wind status descriptions in Greek */
export const WIND_STATUS_DESCRIPTIONS: Record<WindStatus, string> = {
  [WindStatus.CALM]: "Ήρεμα",
  [WindStatus.LIGHT]: "Ασθενής",
  [WindStatus.MODERATE]: "Μέτριος",
  [WindStatus.STRONG]: "Ισχυρός",
};

/** Sea Temperature Status */
export enum SeaTempStatus {
  COLD = "COLD",
  IDEAL = "IDEAL",
  WARM = "WARM",
}

/** Sea temperature descriptions in Greek */
export const SEA_TEMP_DESCRIPTIONS: Record<SeaTempStatus, string> = {
  [SeaTempStatus.COLD]: "Κρύο",
  [SeaTempStatus.IDEAL]: "Ιδανική για Λαβράκι",
  [SeaTempStatus.WARM]: "Ζεστό",
};

/** Pressure Trend */
export enum PressureTrend {
  RISING = "RISING",
  STABLE = "STABLE",
  FALLING = "FALLING",
}

/** Pressure trend descriptions in Greek */
export const PRESSURE_TREND_DESCRIPTIONS: Record<PressureTrend, string> = {
  [PressureTrend.RISING]: "Ανοδική",
  [PressureTrend.STABLE]: "Σταθερή",
  [PressureTrend.FALLING]: "Καθοδική",
};

/** Activity Status */
export enum ActivityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/** Activity status descriptions in Greek */
export const ACTIVITY_STATUS_DESCRIPTIONS: Record<ActivityStatus, string> = {
  [ActivityStatus.ACTIVE]: "Ενεργό",
  [ActivityStatus.INACTIVE]: "Ανενεργό",
};

/** Beaufort scale thresholds in knots (from Server/src/utils/conversions.ts) */
export const KNOTS_TO_BEAUFORT_THRESHOLDS = [
  1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63,
];
