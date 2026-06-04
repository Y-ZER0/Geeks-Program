import { Router } from "express";
import { supabase } from "../db.js";

const router = Router();

const CATEGORY_MAP = { All: null, AI: "AI", Cyber: "Cy", Web: "Wb" };
const TIMEFRAME_COL = { live: "live_pts", w2: "biweekly_pts", mo: "monthly_pts", biweekly: "biweekly_pts", monthly: "monthly_pts" };
const TIMEFRAME_KEY = { live: "live", w2: "w2", mo: "mo", biweekly: "w2", monthly: "mo" };

router.get("/", async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "live";
    const category = req.query.category || "All";
    const col = TIMEFRAME_COL[timeframe];
    if (!col) return res.status(400).json({ error: "Invalid timeframe" });

    // Run period check
    await supabase.rpc("check_periods");

    // Fetch players
    const { data: players, error: playersErr } = await supabase
      .from("players")
      .select("id, display_name, avatar_url")
      .order("display_name", { ascending: true });

    if (playersErr) throw playersErr;

    // Fetch all scores
    const { data: scores, error: scoresErr } = await supabase
      .from("leaderboard_scores")
      .select("player_id, category, live_pts, biweekly_pts, monthly_pts");

    if (scoresErr) throw scoresErr;

    // Group scores by player
    const scoresByPlayer = {};
    for (const s of scores) {
      if (!scoresByPlayer[s.player_id]) scoresByPlayer[s.player_id] = {};
      scoresByPlayer[s.player_id][s.category] = s;
    }

    // Compute initials from display_name
    const getInitials = (name) =>
      name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Build response
    const activeCat = CATEGORY_MAP[category];
    const result = players
      .map((p) => {
        const playerScores = scoresByPlayer[p.id] || {};
        const pts = {};

        for (const tfKey of ["live", "biweekly", "monthly"]) {
          const dbKey = TIMEFRAME_KEY[tfKey];
          pts[dbKey] = {
            AI: playerScores["AI"]?.[TIMEFRAME_COL[tfKey]] ?? 0,
            Cy: playerScores["Cyber"]?.[TIMEFRAME_COL[tfKey]] ?? 0,
            Wb: playerScores["Web"]?.[TIMEFRAME_COL[tfKey]] ?? 0,
          };
        }

        // Compute total score for this filter
        const ptsForFilter = pts[TIMEFRAME_KEY[timeframe]];
        const totalScore = activeCat
          ? (ptsForFilter[activeCat] ?? 0)
          : (ptsForFilter.AI + ptsForFilter.Cy + ptsForFilter.Wb);

        return {
          id: p.id,
          name: p.display_name,
          ini: getInitials(p.display_name),
          avatar_url: p.avatar_url,
          sc: totalScore,
          pts,
        };
      })
      .sort((a, b) => b.sc - a.sc);

    res.json(result);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: err.message });
  }
});

export { router };
