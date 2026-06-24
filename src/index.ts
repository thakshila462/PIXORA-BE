import express from "express";
import cors from "cors";
import authRouter from "./routes/authRouters";
import packageRouter from "./routes/packageRoutes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://pixora-fe.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/packages", packageRouter);

app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

export default app;