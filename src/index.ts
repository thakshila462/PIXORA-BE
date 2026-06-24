import dotenv from "dotenv";
// මුලින්ම env config එක කරන්න (අනිත් ඒවට කලින්)
dotenv.config(); 

const validateEnvironment = () => {
  const missingEnv: string[] = [];

  if (!process.env.JWT_SECRET) missingEnv.push("JWT_SECRET");
  if (!process.env.JWT_REFRESH_SECRET) missingEnv.push("JWT_REFRESH_SECRET");
  if (!process.env.DB_URL && !process.env.MONGO_URI)
    missingEnv.push("DB_URL or MONGO_URI");

  if (missingEnv.length > 0) {
    const message = `Missing required environment variables: ${missingEnv.join(", ")}`;
    console.error(message);
    throw new Error(message);
  }
};

validateEnvironment();

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

// =====================
// DATABASE MIDDLEWARE (FIX FOR VERCEL)
// =====================
// හැම request එකක්ම backend එකට එද්දී DB එක connect වෙලාද කියලා check කරනවා
app.use(async (req, res, next) => {
  try {
    await mongoDB();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// =====================
// CORS CONFIG
// =====================
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pixora-fe.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization",, "x-access-token"],
};

app.use(cors(corsOptions));

// =====================
// HANDLE PRE-FLIGHT (FIX FOR VERCEL)
// =====================
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());

// =====================
// ROUTES
// =====================
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/service-request", serviceRequestRouter);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRoutes);

// =====================
// GLOBAL ERROR HANDLER
// =====================
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
 });

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

mongoDB();

export default app;