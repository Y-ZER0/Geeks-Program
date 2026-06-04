import express from "express";
import cors from "cors";
import leaderboardRoutes from "./routes/leaderboard.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json());

function mountRoute(path, router, label) {
  if (typeof router !== "function") {
    console.error(`Route "${label}" imported at "${path}" is not a middleware function. Got:`, { type: typeof router, value: router });
    app.use(path, (_req, res) => res.status(503).json({ error: `Service unavailable: ${label} route failed to initialize` }));
    return;
  }
  app.use(path, router);
}

mountRoute("/api/leaderboard", leaderboardRoutes, "leaderboard");
mountRoute("/api/auth", authRoutes, "auth");
mountRoute("/api/admin", adminRoutes, "admin");

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

export default app;
