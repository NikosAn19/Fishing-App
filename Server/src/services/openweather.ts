// src/services/openweather.ts

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
    sunriseISO?: string;      // ISO (UTC)
    sunsetISO?: string;       // ISO (UTC)
    day_length_sec?: number;  // διάρκεια ημέρας σε δευτερόλεπτα
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
    const sunset  = typeof d.sunset  === "number" ? d.sunset  : undefined; // unix sec
  
    return {
      sunriseISO: sunrise ? new Date(sunrise * 1000).toISOString() : undefined,
      sunsetISO:  sunset  ? new Date(sunset  * 1000).toISOString()  : undefined,
      day_length_sec: sunrise && sunset ? sunset - sunrise : undefined,
    };
  }
  
  // ──────────────────────────────────────────────────────────────────────────────
  // Wind (One Call 3.0) — μόνο άνεμος
  // ──────────────────────────────────────────────────────────────────────────────
  
  /** 1 m/s -> knots */
  const MPS_TO_KNOTS = 1.943844;
  
  /** 16-ριος ροδόκαμπος (ελληνικά labels) */
  function degToCardinal(deg?: number | null): string | null {
    if (deg == null || isNaN(deg)) return null;
    const dirs = [
      "Β",   // N
      "ΒΒΑ", // NNE
      "ΒΑ",  // NE
      "ΑΒΑ", // ENE
      "Α",   // E
      "ΑΝΑ", // ESE
      "ΝΑ",  // SE
      "ΝΝΑ", // SSE
      "Ν",   // S
      "ΝΝΔ", // SSW
      "ΝΔ",  // SW
      "ΔΝΔ", // WSW
      "Δ",   // W
      "ΔΒΔ", // WNW
      "ΒΔ",  // NW
      "ΒΒΔ", // NNW
    ];
    const idx = Math.round(deg / 22.5) % 16;
    return dirs[idx] || null;
  }
  
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
    const curGust  = typeof cur.wind_gust  === "number" ? cur.wind_gust  : null; // m/s
    const curDeg   = typeof cur.wind_deg   === "number" ? cur.wind_deg   : null;
  
    // hourly
    const hourlyArr: any[] = Array.isArray(json?.hourly) ? json.hourly : [];
    const timeISO: string[] = [];
    const wind_speed_kn: (number | null)[] = [];
    const wind_dir_deg: (number | null)[] = [];
    const wind_gust_kn: (number | null)[] = [];
  
    for (const h of hourlyArr) {
      const dt = typeof h.dt === "number" ? h.dt : null; // unix sec (UTC)
      timeISO.push(dt ? new Date(dt * 1000).toISOString() : new Date().toISOString());
      wind_speed_kn.push(
        typeof h.wind_speed === "number" ? +(h.wind_speed * MPS_TO_KNOTS).toFixed(2) : null
      );
      wind_dir_deg.push(typeof h.wind_deg === "number" ? h.wind_deg : null);
      wind_gust_kn.push(
        typeof h.wind_gust === "number" ? +(h.wind_gust * MPS_TO_KNOTS).toFixed(2) : null
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
  