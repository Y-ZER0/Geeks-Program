import express from "express";
import cors from "cors";
import { router as leaderboardRoutes } from "./routes/leaderboard.js";
import { router as authRoutes } from "./routes/auth.js";
import { router as adminRoutes } from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

export { app };
