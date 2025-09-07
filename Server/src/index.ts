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
import uploadsRoutes from "./routes/uploads"; // ✅ NEW

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:19006",
      "http://localhost:8081",
      "http://localhost:19000",
      "http://localhost:19001",
      "http://localhost:19002",
      "http://localhost:3000",
    ],
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
app.use("/api/uploads", uploadsRoutes); // ✅ NEW (POST /api/uploads/sign)

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

// Start server
app.listen(PORT, () => {
  console.log(`🐟 Fishing App Server running on port ${PORT}`);
  console.log(`🌊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗃️  Database: ${
      process.env.MONGODB_URI || "mongodb://localhost:27017/fishing-app"
    }`
  );
  // Helpful logs for R2 config
  if (process.env.STORAGE_PROVIDER === "r2") {
    console.log("☁️  R2 endpoint:", process.env.R2_ENDPOINT);
    console.log("🪣 R2 bucket:", process.env.S3_BUCKET);
  }
});

export default app;




