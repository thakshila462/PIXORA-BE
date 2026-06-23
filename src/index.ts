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

/* =========================
   ENV CHECK (SAFE VERSION)
========================= */
const requiredEnvVars = ["DB_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing ENV:", missingVars.join(", "));
}

/* =========================
   CORS FIX (VERY IMPORTANT)
========================= */
const allowedOrigins = [
  "https://pixora-fe.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (server-to-server, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   DB CONNECTION MIDDLEWARE
   (ensures connection per-request on serverless,
   instead of relying only on cold-start connect)
========================= */
app.use(async (req, res, next) => {
  try {
    await mongoDB();
    next();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/* =========================
   ROUTES
========================= */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/service-request", serviceRequestRouter);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/enhance", enhanceRoute);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running successfully 🚀",
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
   (so crashes return JSON + CORS headers
   instead of a bare Vercel error page)
========================= */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("🔥 Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  },
);

/* =========================
   LOCAL ONLY SERVER
========================= */
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

/* =========================
   VERCEL EXPORT
========================= */
export default app;
