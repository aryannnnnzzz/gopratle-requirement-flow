import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, isDbConnected } from "./config/db";
import { requireDbConnection } from "./middleware/dbCheck";
import { errorHandler } from "./middleware/errorHandler";
import requirementRoutes from "./routes/requirement.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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

// API Routes with DB availability protection
app.use("/api", requireDbConnection);
app.use("/api/requirements", requirementRoutes);

// Centralized Error Handler (must be registered after routes)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] Requirement backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/health`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
