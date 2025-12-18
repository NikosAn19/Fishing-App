declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI?: string;
      JWT_ACCESS_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      JWT_ACCESS_TTL?: string;
      JWT_REFRESH_TTL?: string;
      OWM_KEY?: string;
      GOOGLE_MAPS_API_KEY?: string;
      GOOGLE_CLIENT_ID?: string;
      ALLOWED_ORIGINS?: string;
      RATE_LIMIT_WINDOW?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
    }
  }
}

export {};
