import { MPS_TO_KNOTS } from "../../utils/conversions";
import { WeatherCondition, mapWeatherCondition } from "../../types/weather";

// ──────────────────────────────────────────────────────────────────────────────
// Single One Call API Function
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Makes a single API call to OpenWeather One Call 3.0 to fetch all data.
 * Returns the raw API response with current, hourly, daily, and minutely data.
 */
export async function fetchOneCallData(
  lat: number,
  lon: number,
  apiKey = process.env.OWM_KEY as string
): Promise<any> {
  if (!apiKey) {
    throw new Error("Missing OpenWeather API key (env OWM_KEY)");
  }

  const url =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=alerts` + // Only exclude alerts, get everything else
    `&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 400);
    throw new Error(`OW OneCall HTTP ${res.status} – ${snippet}`);
  }

  return res.json();
}

// ──────────────────────────────────────────────────────────────────────────────
// Moon (One Call 3.0)
// ──────────────────────────────────────────────────────────────────────────────

export type MoonOut = {
  fraction: number; // 0..1 (φωτεινότητα)
  label: string; // λεκτική φάση
  moonrise?: string; // ISO (UTC)
  moonset?: string; // ISO (UTC)
};

/** Χαρτογράφηση OW moon_phase (0..1) σε ετικέτα */
function phaseLabelFromNormalized(p: number) {
  // OpenWeather: 0/1 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter
  if (p < 0.03 || p > 0.97) return "Νέα Σελήνη";
  if (p < 0.22) return "Ημιαύξουσα";
  if (p < 0.28) return "Πρώτο Τέταρτο";
  if (p < 0.47) return "Αύξουσα Αμβλυφώτις";
  if (p < 0.53) return "Πανσέληνος";
  if (p < 0.72) return "Φθίνουσα Αμβλυφώτις";
  if (p < 0.78) return "Τρίτο Τέταρτο";
  return "Ημείωση Ημισελήνου";
}

/** Προσεγγιστική μετατροπή moon_phase (0..1) → φωτεινότητα 0..1 */
function phaseToIlluminationFraction(phase: number) {
  // ~0.5*(1 - cos(2π*phase)) → 0 new, 1 full
  return 0.5 * (1 - Math.cos(2 * Math.PI * phase));
}

/** Μετατρέπει UNIX sec → ISO string UTC */
function unixToISO(unixSec?: number): string | undefined {
  if (!unixSec && unixSec !== 0) return undefined;
  return new Date(unixSec * 1000).toISOString();
}

/** 16-ριος ροδόκαμπος (ελληνικά labels) */
function degToCardinal(deg?: number | null): string | null {
  if (deg == null || isNaN(deg)) return null;
  const dirs = [
    "Β", // N
    "ΒΒΑ", // NNE
    "ΒΑ", // NE
    "ΑΒΑ", // ENE
    "Α", // E
    "ΑΝΑ", // ESE
    "ΝΑ", // SE
    "ΝΝΑ", // SSE
    "Ν", // S
    "ΝΝΔ", // SSW
    "ΝΔ", // SW
    "ΔΝΔ", // WSW
    "Δ", // W
    "ΔΒΔ", // WNW
    "ΒΔ", // NW
    "ΒΒΔ", // NNW
  ];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx] || null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Extraction Functions (from single One Call response)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extract wind data from One Call API response
 */
export function extractWindData(json: any): WindOut {
  // current
  const cur = json?.current ?? {};
  const curSpeed = typeof cur.wind_speed === "number" ? cur.wind_speed : null; // m/s
  const curGust = typeof cur.wind_gust === "number" ? cur.wind_gust : null; // m/s
  const curDeg = typeof cur.wind_deg === "number" ? cur.wind_deg : null;

  // hourly
  const hourlyArr: any[] = Array.isArray(json?.hourly) ? json.hourly : [];
  const timeISO: string[] = [];
  const wind_speed_kn: (number | null)[] = [];
  const wind_dir_deg: (number | null)[] = [];
  const wind_gust_kn: (number | null)[] = [];

  for (const h of hourlyArr) {
    const dt = typeof h.dt === "number" ? h.dt : null; // unix sec (UTC)
    timeISO.push(
      dt ? new Date(dt * 1000).toISOString() : new Date().toISOString()
    );
    wind_speed_kn.push(
      typeof h.wind_speed === "number"
        ? +(h.wind_speed * MPS_TO_KNOTS).toFixed(2)
        : null
    );
    wind_dir_deg.push(typeof h.wind_deg === "number" ? h.wind_deg : null);
    wind_gust_kn.push(
      typeof h.wind_gust === "number"
        ? +(h.wind_gust * MPS_TO_KNOTS).toFixed(2)
        : null
    );
  }

  return {
    current: {
      speed_kn: curSpeed != null ? +(curSpeed * MPS_TO_KNOTS).toFixed(2) : null,
      dir_deg: curDeg,
      dir_cardinal: degToCardinal(curDeg),
      gust_kn: curGust != null ? +(curGust * MPS_TO_KNOTS).toFixed(2) : null,
    },
    hourly: { timeISO, wind_speed_kn, wind_dir_deg, wind_gust_kn },
  };
}

/**
 * Extract moon data from One Call API response
 */
export function extractMoonData(json: any): MoonOut {
  const d = json?.daily?.[0] || {};
  const phase = Number(d.moon_phase ?? 0); // 0..1
  const fraction = phaseToIlluminationFraction(phase);
  const label = phaseLabelFromNormalized(phase);

  return {
    fraction,
    label,
    moonrise: unixToISO(d.moonrise),
    moonset: unixToISO(d.moonset),
  };
}

/**
 * Extract sun data from One Call API response
 */
export function extractSunData(json: any): SunOut {
  const d = json?.daily?.[0] || {};
  const sunrise = typeof d.sunrise === "number" ? d.sunrise : undefined; // unix sec
  const sunset = typeof d.sunset === "number" ? d.sunset : undefined; // unix sec

  return {
    sunriseISO: sunrise ? new Date(sunrise * 1000).toISOString() : undefined,
    sunsetISO: sunset ? new Date(sunset * 1000).toISOString() : undefined,
    day_length_sec: sunrise && sunset ? sunset - sunrise : undefined,
  };
}

/**
 * Extract rain data from One Call API response
 */
export function extractRainData(
  json: any,
  tz: string
): {
  current: {
    isRaining: boolean;
    intensity_mm: number | null;
    description: string | null;
  };
  today: {
    willRain: boolean;
    stopsAt: string | null;
    totalMm: number | null;
  };
  daily: Array<{
    date: string;
    willRain: boolean;
    totalMm: number | null;
    pop: number;
    description: string | null;
  }>;
} {
  const current = json?.current ?? {};
  const hourly = Array.isArray(json?.hourly) ? json.hourly : [];
  const daily = Array.isArray(json?.daily) ? json.daily : [];

  // Current rain status
  const rain1h = current.rain?.["1h"];
  const hasRain = current.weather?.some((w: any) => w.main === "Rain");
  const isRaining = (rain1h != null && rain1h > 0) || hasRain;
  const intensity_mm = typeof rain1h === "number" ? rain1h : null;
  const description =
    current.weather?.find((w: any) => w.main === "Rain")?.description || null;

  // Today's forecast - find when rain stops
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  let willRainToday = false;
  let stopsAt: string | null = null;
  let totalMmToday = 0;
  let lastRainHour: Date | null = null;

  for (const h of hourly) {
    const hourTime = typeof h.dt === "number" ? new Date(h.dt * 1000) : null;
    if (!hourTime) continue;

    // Only process hours within today
    if (hourTime < todayStart || hourTime >= todayEnd) continue;

    const hourRain = h.rain?.["1h"];
    const hourHasRain = h.weather?.some((w: any) => w.main === "Rain");
    const isRainingThisHour = (hourRain != null && hourRain > 0) || hourHasRain;

    if (isRainingThisHour) {
      willRainToday = true;
      if (hourRain != null) {
        totalMmToday += hourRain;
      }
      // Track the last hour with rain
      lastRainHour = hourTime;
    } else if (willRainToday && lastRainHour) {
      // Rain has stopped - stopsAt is the end of the last rain hour
      // Add 1 hour to get the end time
      const stopTime = new Date(lastRainHour);
      stopTime.setHours(stopTime.getHours() + 1);
      stopsAt = stopTime.toISOString();
      break;
    }
  }

  // If it's still raining at the end of today, set stopsAt to end of day
  if (willRainToday && !stopsAt && lastRainHour) {
    const stopTime = new Date(lastRainHour);
    stopTime.setHours(stopTime.getHours() + 1);
    // Don't go past today
    if (stopTime < todayEnd) {
      stopsAt = stopTime.toISOString();
    } else {
      stopsAt = todayEnd.toISOString();
    }
  }

  // Daily forecasts (next 8 days)
  const dailyForecasts = daily.slice(0, 8).map((d: any) => {
    const date = typeof d.dt === "number" ? new Date(d.dt * 1000) : new Date();
    const rain = d.rain || d.precipitation; // Some APIs use 'precipitation'
    const totalMm = typeof rain === "number" ? rain : null;
    const willRain =
      (totalMm != null && totalMm > 0) ||
      d.weather?.some((w: any) => w.main === "Rain");
    const pop = typeof d.pop === "number" ? d.pop : 0;
    const desc =
      d.weather?.find((w: any) => w.main === "Rain")?.description || null;

    return {
      date: date.toISOString().split("T")[0], // YYYY-MM-DD
      willRain,
      totalMm,
      pop,
      description: desc,
    };
  });

  return {
    current: {
      isRaining,
      intensity_mm,
      description,
    },
    today: {
      willRain: willRainToday,
      stopsAt,
      totalMm: willRainToday ? totalMmToday : null,
    },
    daily: dailyForecasts,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Weather Conditions (One Call 3.0)
// ──────────────────────────────────────────────────────────────────────────────

export type WeatherConditionOut = {
  current: {
    condition: WeatherCondition;
    main: string | null;
    description: string | null;
    icon: string | null;
  };
  hourly: {
    condition: WeatherCondition[];
    main: (string | null)[];
    description: (string | null)[];
    icon: (string | null)[];
  };
};

/**
 * Extract weather condition data from One Call API response
 * Maps OpenWeather weather condition IDs to standardized WeatherCondition enum
 */
export function extractWeatherConditions(json: any): WeatherConditionOut {
  const current = json?.current ?? {};
  const hourly = Array.isArray(json?.hourly) ? json.hourly : [];

  // Current weather
  const currentWeather = current.weather?.[0];
  const currentId =
    typeof currentWeather?.id === "number" ? currentWeather.id : null;

  // Hourly weather conditions
  const hourlyCondition: WeatherCondition[] = [];
  const hourlyMain: (string | null)[] = [];
  const hourlyDescription: (string | null)[] = [];
  const hourlyIcon: (string | null)[] = [];

  for (const h of hourly) {
    const weather = h.weather?.[0];
    const id = typeof weather?.id === "number" ? weather.id : null;

    hourlyCondition.push(mapWeatherCondition(id));
    hourlyMain.push(weather?.main ?? null);
    hourlyDescription.push(weather?.description ?? null);
    hourlyIcon.push(weather?.icon ?? null);
  }

  return {
    current: {
      condition: mapWeatherCondition(currentId),
      main: currentWeather?.main ?? null,
      description: currentWeather?.description ?? null,
      icon: currentWeather?.icon ?? null,
    },
    hourly: {
      condition: hourlyCondition,
      main: hourlyMain,
      description: hourlyDescription,
      icon: hourlyIcon,
    },
  };
}

/**
 * Φέρνει ΜΟΝΟ τα πεδία σελήνης από One Call 3.0 (daily[0]).
 * - Χρειάζεται process.env.OWM_KEY (ή πέρασε apiKey ως όρισμα)
 */
export async function fetchMoonFromOneCall(
  lat: number,
  lon: number,
  apiKey = process.env.OWM_KEY as string
): Promise<MoonOut> {
  if (!apiKey) {
    throw new Error("Missing OpenWeather API key (env OWM_KEY)");
  }

  const url =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,hourly,alerts` +
    `&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 300);
    throw new Error(`OW OneCall HTTP ${res.status} – ${snippet}`);
  }
  const json: any = await res.json();
  const d = json?.daily?.[0] || {};

  const phase = Number(d.moon_phase ?? 0); // 0..1
  const fraction = phaseToIlluminationFraction(phase);
  const label = phaseLabelFromNormalized(phase);

  return {
    fraction,
    label,
    moonrise: unixToISO(d.moonrise),
    moonset: unixToISO(d.moonset),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
/** SUNRISE/SUNSET (One Call 3.0) */
// ──────────────────────────────────────────────────────────────────────────────

export type SunOut = {
  sunriseISO?: string; // ISO (UTC)
  sunsetISO?: string; // ISO (UTC)
  day_length_sec?: number; // διάρκεια ημέρας σε δευτερόλεπτα
};

/**
 * Παίρνει sunrise/sunset από One Call 3.0 (daily[0]).
 * Επιστρέφει ISO (UTC) + day_length_sec.
 */
export async function fetchSunFromOneCall(
  lat: number,
  lon: number,
  apiKey = process.env.OWM_KEY as string
): Promise<SunOut> {
  if (!apiKey) throw new Error("Missing OpenWeather API key (env OWM_KEY)");

  const url =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,hourly,alerts` +
    `&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 300);
    throw new Error(`OW OneCall (sun) HTTP ${res.status} – ${snippet}`);
  }

  const json: any = await res.json();
  const d = json?.daily?.[0] || {};

  const sunrise = typeof d.sunrise === "number" ? d.sunrise : undefined; // unix sec
  const sunset = typeof d.sunset === "number" ? d.sunset : undefined; // unix sec

  return {
    sunriseISO: sunrise ? new Date(sunrise * 1000).toISOString() : undefined,
    sunsetISO: sunset ? new Date(sunset * 1000).toISOString() : undefined,
    day_length_sec: sunrise && sunset ? sunset - sunrise : undefined,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Wind (One Call 3.0) — μόνο άνεμος (DEPRECATED - use extractWindData instead)
// ──────────────────────────────────────────────────────────────────────────────

export type WindOut = {
  current: {
    speed_kn: number | null;
    dir_deg: number | null;
    dir_cardinal: string | null;
    gust_kn: number | null;
  };
  hourly: {
    timeISO: string[];
    wind_speed_kn: (number | null)[];
    wind_dir_deg: (number | null)[];
    wind_gust_kn: (number | null)[];
  };
};

/**
 * Παίρνουμε ΜΟΝΟ άνεμο από One Call 3.0:
 * - current: wind_speed (m/s), wind_deg, wind_gust
 * - hourly[]: wind_speed, wind_deg, wind_gust
 * Επιστρέφουμε ταχύτητες σε knots και μεταφράζουμε την κατεύθυνση σε cardinal.
 */
export async function fetchWindFromOneCall(
  lat: number,
  lon: number,
  apiKey = process.env.OWM_KEY as string
): Promise<WindOut> {
  if (!apiKey) throw new Error("Missing OpenWeather API key (env OWM_KEY)");

  const url =
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 400);
    throw new Error(`OW OneCall (wind) HTTP ${res.status} – ${snippet}`);
  }
  const json: any = await res.json();

  // current
  const cur = json?.current ?? {};
  const curSpeed = typeof cur.wind_speed === "number" ? cur.wind_speed : null; // m/s
  const curGust = typeof cur.wind_gust === "number" ? cur.wind_gust : null; // m/s
  const curDeg = typeof cur.wind_deg === "number" ? cur.wind_deg : null;

  // hourly
  const hourlyArr: any[] = Array.isArray(json?.hourly) ? json.hourly : [];
  const timeISO: string[] = [];
  const wind_speed_kn: (number | null)[] = [];
  const wind_dir_deg: (number | null)[] = [];
  const wind_gust_kn: (number | null)[] = [];

  for (const h of hourlyArr) {
    const dt = typeof h.dt === "number" ? h.dt : null; // unix sec (UTC)
    timeISO.push(
      dt ? new Date(dt * 1000).toISOString() : new Date().toISOString()
    );
    wind_speed_kn.push(
      typeof h.wind_speed === "number"
        ? +(h.wind_speed * MPS_TO_KNOTS).toFixed(2)
        : null
    );
    wind_dir_deg.push(typeof h.wind_deg === "number" ? h.wind_deg : null);
    wind_gust_kn.push(
      typeof h.wind_gust === "number"
        ? +(h.wind_gust * MPS_TO_KNOTS).toFixed(2)
        : null
    );
  }

  return {
    current: {
      speed_kn: curSpeed != null ? +(curSpeed * MPS_TO_KNOTS).toFixed(2) : null,
      dir_deg: curDeg,
      dir_cardinal: degToCardinal(curDeg),
      gust_kn: curGust != null ? +(curGust * MPS_TO_KNOTS).toFixed(2) : null,
    },
    hourly: { timeISO, wind_speed_kn, wind_dir_deg, wind_gust_kn },
  };
}
