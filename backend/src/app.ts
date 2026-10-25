import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { isDbConnected } from "./config/db";
import { requireDbConnection } from "./middleware/dbCheck";
import { errorHandler } from "./middleware/errorHandler";
import requirementRoutes from "./routes/requirement.routes";

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === CLIENT_ORIGIN || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
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
