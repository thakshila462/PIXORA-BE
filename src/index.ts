import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";

import authRouter from "./routes/authRouters";
import packageRouter from "./routes/packageRoutes";
import aiRoutes from "./routes/aiRoutes";
import enhanceRoute from "./routes/enhanceRoute";
import serviceRequestRouter from "./routes/serviceRequestRoutes";
import userRouter from "./routes/UserRoutes";
import adminRoutes from "./routes/adminRoutes";
import mongoDB from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

// Environment validation
const requiredEnvVars = ["DB_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`,
  );

  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://pixora-fe.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await mongoDB();
    next();
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    return res.status(503).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/service-request", serviceRequestRouter);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/enhance", enhanceRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TypeScript API is running successfully on Vercel 🚀",
  });
});

// Local development only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
