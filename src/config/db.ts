import mongoose from "mongoose";

const DB_URL = process.env.DB_URL as string;
let isConnected = false;

const mongoDB = async () => {
  if (isConnected) return;

  if (!DB_URL) {
    throw new Error("DB_URL is not set in environment variables");
  }

  try {
    await mongoose.connect(DB_URL);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

export default mongoDB;