import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  maxFileSize: number;
  uploadPath: string;
  allowedOrigins: string[];
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
  openWeatherApiKey?: string;
  googleMapsApiKey?: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/fishing-app",
  jwtSecret: process.env.JWT_SECRET || "fishing-app-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:19006",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19001",
    "http://localhost:19002",
    "http://localhost:3000",
    "http://192.168.2.5:19006",
    "http://192.168.2.5:8081",
    "http://192.168.2.5:19000",
    "http://192.168.2.5:19001",
    "http://192.168.2.5:19002",
    "http://192.168.2.5:3000",
  ],
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  openWeatherApiKey: process.env.OWM_KEY,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};

export default config;










