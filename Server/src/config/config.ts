import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().url().default("mongodb://localhost:27017/fishing-app"),
  JWT_ACCESS_SECRET: z.string().min(1).default("fishing-app-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(1).default("fishing-app-refresh-secret"),
  JWT_ACCESS_TTL: z.string().default("2h"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_PATH: z.string().default("./uploads"),
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW: z.coerce.number().default(15),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  OWM_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  MATRIX_URL: z.string().url().default("http://localhost:8008"),
  MATRIX_ADMIN_USER: z.string().min(1).default("psaraki_app_admin"),
  MATRIX_ADMIN_PASS: z.string().min(1).default("pergaminos007"),
  MATRIX_SERVER_NAME: z.string().min(1).default("localhost"),
});

// Parse and validate env vars
const env = envSchema.parse(process.env);

interface Config {
  port: number;
  nodeEnv: "development" | "production" | "test";
  mongoUri: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  maxFileSize: number;
  uploadPath: string;
  allowedOrigins: string[];
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  openWeatherApiKey?: string;
  googleMapsApiKey?: string;
  googleClientId?: string;
  matrix: {
    url: string;
    adminUser: string;
    adminPass: string;
    serverName: string;
  };
}

const config: Config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  mongoUri: env.MONGODB_URI,
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: env.JWT_ACCESS_TTL,
  jwtRefreshExpiresIn: env.JWT_REFRESH_TTL,
  maxFileSize: env.MAX_FILE_SIZE,
  uploadPath: env.UPLOAD_PATH,
  allowedOrigins: env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19001",
    "http://localhost:19002",
    "http://localhost:3000",
    // Add other defaults as needed or rely on env var
  ],
  rateLimitWindow: env.RATE_LIMIT_WINDOW,
  rateLimitMaxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  openWeatherApiKey: env.OWM_KEY,
  googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
  googleClientId: env.GOOGLE_CLIENT_ID,
  matrix: {
    url: env.MATRIX_URL,
    adminUser: env.MATRIX_ADMIN_USER,
    adminPass: env.MATRIX_ADMIN_PASS,
    serverName: env.MATRIX_SERVER_NAME,
  },
};

export default config;


















