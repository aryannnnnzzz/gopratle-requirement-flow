import mongoose from "mongoose";

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "\n[DB ERROR] MONGODB_URI environment variable is not defined.\n" +
      "Please set MONGODB_URI in backend/.env (e.g. mongodb://localhost:27017/gopratle_requirements or your MongoDB Atlas URI).\n"
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DB] Successfully connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `\n[DB ERROR] Failed to connect to MongoDB at "${uri.replace(/\/\/.*@/, "//@***:***@")}".\n` +
      `Reason: ${message}\n` +
      "Check your connection string, ensure MongoDB service is running, or verify your Atlas IP whitelist and credentials.\n"
    );
    return false;
  }
};
