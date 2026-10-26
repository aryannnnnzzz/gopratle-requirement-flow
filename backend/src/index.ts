import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const startServer = async () => {
  const connected = await connectDB();
  if (!connected && process.env.NODE_ENV === "production") {
    console.error("[FATAL] Server cannot start without database connection in production.");
    process.exit(1);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Server] Requirement backend running on http://${HOST}:${PORT}`);
    console.log(`[Server] Health check available at http://${HOST}:${PORT}/health`);
  });
};

startServer();
