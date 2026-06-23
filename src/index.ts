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

app.use(
  cors({
    origin: [
      "https://pixora-fe.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   CONNECT DB ON START ONLY
========================= */
mongoDB()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB error:", err));

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
