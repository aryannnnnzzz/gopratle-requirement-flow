import mongoose from "mongoose";

// Set bufferCommands to false to prevent operations from buffering when DB is down
mongoose.set("bufferCommands", false);

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "\n[DB ERROR] MONGODB_URI environment variable is not defined.\n" +
      "Please set MONGODB_URI in backend/.env.\n"
    );
    if (process.env.NODE_ENV === "production") {
      console.error("[FATAL] MONGODB_URI is required in production. Exiting.\n");
      process.exit(1);
    }
    return false;
  }

  // Guard against localhost placeholder in production
  if (
    process.env.NODE_ENV === "production" &&
    (uri.includes("localhost") || uri.includes("127.0.0.1") || uri.includes("0.0.0.0"))
  ) {
    console.error(
      `\n[FATAL] In production, MONGODB_URI cannot point to a localhost placeholder.\n` +
      `Provided: "${uri.replace(/\/\/.*@/, "//@***:***@")}"\n` +
      `Please provide a valid remote MongoDB connection string (e.g. MongoDB Atlas cluster).\n`
    );
    process.exit(1);
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
    if (process.env.NODE_ENV === "production") {
      console.error("[FATAL] Database connection failed in production. Exiting.\n");
      process.exit(1);
    }
    return false;
  }
};
