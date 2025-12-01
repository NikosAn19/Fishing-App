import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { connectDB } from "./utils/database";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import catchRoutes from "./routes/catches";
import spotRoutes from "./routes/spots";
import weatherRoutes from "./routes/weather";
import forecastRoutes from "./routes/forecast";
import uploadsRoutes from "./routes/uploads";
import adventureRoutes from "./routes/adventures";
import favoriteSpotsRoutes from "./routes/favoriteSpots";
import chatRoutes from "./routes/chatRoutes";
import { seedChannels } from "./scripts/seedChannels";

const app = express();

// Configure trust proxy so rate limiting & logging can rely on X-Forwarded-* headers
const trustProxySetting = process.env.TRUST_PROXY;
if (trustProxySetting !== undefined) {
  const normalizedTrustProxy =
    trustProxySetting === "true"
      ? true
      : trustProxySetting === "false"
      ? false
      : Number.isNaN(Number(trustProxySetting))
      ? trustProxySetting
      : Number(trustProxySetting);

  app.set("trust proxy", normalizedTrustProxy);
} else {
  // Default: trust first proxy (suitable for ngrok / reverse proxies during development)
  app.set("trust proxy", 1);
}
const PORT = Number(process.env.PORT) || 3000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
// Allow ngrok domains dynamically (for tunnel mode)
const nodeEnv = process.env.NODE_ENV || "development";
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const allowAllOrigins = allowedOriginsEnv === "*";

const allowedOrigins = allowAllOrigins
  ? []
  : allowedOriginsEnv
  ? allowedOriginsEnv.split(",").map((o) => o.trim())
  : [
      "http://localhost:19006",
      "http://localhost:8081",
      "http://localhost:19000",
      "http://localhost:19001",
      "http://localhost:19002",
      "http://localhost:3000",
      "http://192.168.2.2:19006",
      "http://192.168.2.2:8081",
      "http://192.168.2.2:19000",
      "http://192.168.2.2:19001",
      "http://192.168.2.2:19002",
      "http://192.168.2.2:3000",
      "http://192.168.2.13:19006",
      "http://192.168.2.13:8081",
      "http://192.168.2.13:19000",
      "http://192.168.2.13:19001",
      "http://192.168.2.13:19002",
      "http://192.168.2.13:3000",
      "http://192.168.2.5:19006",
      "http://192.168.2.5:8081",
      "http://192.168.2.5:19000",
      "http://192.168.2.5:19001",
      "http://192.168.2.5:19002",
      "http://192.168.2.5:3000",
      "http://10.120.42.28:19006",
      "http://10.120.42.28:8081",
      "http://10.120.42.28:19000",
      "http://10.120.42.28:19001",
      "http://10.120.42.28:19002",
      "http://10.120.42.28:3000",
      "https://waney-beverly-interminable.ngrok-free.dev",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowAllOrigins || nodeEnv === "development") {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        origin.includes(".ngrok.io") ||
        origin.includes(".ngrok-free.app") ||
        origin.includes(".ngrok.app")
      ) {
        return callback(null, true);
      }

      if (origin.includes(".exp.direct")) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/**
 * Static files (local dev only)
 * NOTE: Μεταφέραμε το static από "/uploads" -> "/static"
 * για να μην συγκρουστεί με το API "/api/uploads".
 */
app.use("/static", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/catches", catchRoutes);
app.use("/api/spots", spotRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/adventures", adventureRoutes);
app.use("/api/favorite-spots", favoriteSpotsRoutes);
app.use("/api/chat", chatRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Fishing App API Server",
    version: "1.0.0",
    endpoints: [
      "GET  /health                          - Health check",
      "POST /api/auth/register               - User registration",
      "POST /api/auth/login                  - User login",
      "GET  /api/catches                     - Get catches",
      "GET  /api/spots                       - Get fishing spots",
      "GET  /api/weather                     - Get weather data",
      "GET  /api/forecast                    - Get unified fishing forecast",
      "POST /api/uploads/sign                - Get presigned URL for R2 upload", // ✅
      "GET  /static/*                        - Serve local static (dev only)",
    ],
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server - try binding to specific interface
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(
    `🐟 Fishing App Server running on 0.0.0.0:${PORT} (accessible via localhost and 10.0.2.2)`
  );
  console.log(
    `🌊 Server also accessible via: http://10.120.42.28:${PORT} (mobile hotspot)`
  );
  console.log(`🌊 Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Seed channels on startup
  seedChannels();
});

export default app;
