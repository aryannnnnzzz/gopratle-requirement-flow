import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { isDbConnected } from "./config/db";
import { requireDbConnection } from "./middleware/dbCheck";
import { errorHandler } from "./middleware/errorHandler";
import requirementRoutes from "./routes/requirement.routes";

const app = express();
// Helper to normalize origins by trimming and stripping trailing slashes
const normalizeOrigin = (url: string): string => url.trim().replace(/\/+$/, "");

// Parse allowed origins from CLIENT_ORIGIN (supports comma-separated list)
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.CLIENT_ORIGIN;
  if (envOrigins) {
    return envOrigins
      .split(",")
      .map(normalizeOrigin)
      .filter(Boolean);
  }
  // Only fallback to localhost in development, never in production
  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:3000"];
  }
  return [];
};

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or same-origin (curl, health checks, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const allowedOrigins = getAllowedOrigins();

      // In development, allow localhost origins
      if (
        process.env.NODE_ENV !== "production" &&
        (normalizedOrigin.startsWith("http://localhost:") ||
          normalizedOrigin.startsWith("http://127.0.0.1:"))
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health Check Endpoint (includes DB connection state)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    db: isDbConnected() ? "connected" : "disconnected",
  });
});

// API Routes protected by DB connection check
app.use("/api", requireDbConnection);
app.use("/api/requirements", requirementRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
