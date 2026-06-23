import mongoose from "mongoose";

const DB_URL = process.env.DB_URL as string;

let dbConnection: Promise<typeof mongoose> | null = null;

const mongoDB = async () => {
  if (dbConnection) {
    return dbConnection;
  }

  if (!DB_URL) {
    throw new Error("DB_URL environment variable is not set");
  }

  dbConnection = mongoose.connect(DB_URL);

  try {
    await dbConnection;
    console.log("✅ MongoDB connected");
  } catch (error) {
    dbConnection = null;
    console.error("❌ DB connection error:", error);
    throw error;
  }

  return dbConnection;
};

export default mongoDB;
