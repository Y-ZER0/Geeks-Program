import { Router } from "express";
import { supabase } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// GET /api/admin/players — list all players with scores
router.get("/players", async (req, res) => {
  try {
    const { data: players, error: pErr } = await supabase
      .from("players")
      .select("id, display_name, avatar_url, created_at")
      .order("display_name", { ascending: true });

    if (pErr) throw pErr;

    const { data: scores, error: sErr } = await supabase
      .from("leaderboard_scores")
      .select("player_id, category, live_pts, biweekly_pts, monthly_pts");

    if (sErr) throw sErr;

    const scoresByPlayer = {};
    for (const s of scores) {
      if (!scoresByPlayer[s.player_id]) scoresByPlayer[s.player_id] = [];
      scoresByPlayer[s.player_id].push(s);
    }

    const result = players.map((p) => ({
      ...p,
      scores: scoresByPlayer[p.id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("List players error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/players — create a new player
router.post("/players", async (req, res) => {
  try {
    const { display_name } = req.body;
    if (!display_name) return res.status(400).json({ error: "display_name is required" });

    // Create player
    const { data: player, error: pErr } = await supabase
      .from("players")
      .insert({ display_name })
      .select()
      .single();

    if (pErr) throw pErr;

    // Create score rows for all three categories
    const cats = ["AI", "Cyber", "Web"];
    const scoreRows = cats.map((category) => ({
      player_id: player.id,
      category,
      live_pts: 0,
      biweekly_pts: 0,
      monthly_pts: 0,
    }));

    const { error: sErr } = await supabase
      .from("leaderboard_scores")
      .insert(scoreRows);

    if (sErr) throw sErr;

    res.status(201).json(player);
  } catch (err) {
    console.error("Create player error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/players/:id/points — award or deduct points
router.post("/players/:id/points", async (req, res) => {
  try {
    const { id } = req.params;
    const { category, delta, note } = req.body;

    if (!delta || delta === 0) return res.status(400).json({ error: "delta must be non-zero" });
    if (!["AI", "Cyber", "Web"].includes(category)) {
      return res.status(400).json({ error: "category must be AI, Cyber, or Web" });
    }

    // Call the Postgres function
    const { data, error } = await supabase.rpc("award_points", {
      p_player_id: id,
      p_admin_id: req.admin.id,
      p_category: category,
      p_delta: delta,
      p_note: note || null,
    });

    if (error) throw error;

    res.json({ updated: data });
  } catch (err) {
    console.error("Award points error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-log — view point event history
router.get("/audit-log", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const playerId = req.query.player_id || null;

    let query = supabase
      .from("point_events")
      .select("id, player_id, admin_id, category, delta, note, event_date, created_at, players!inner(display_name), admins!left(username)")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (playerId) {
      query = query.eq("player_id", playerId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const { count } = await supabase
      .from("point_events")
      .select("id", { count: "exact", head: true })
      .maybeSingle();

    const result = data.map((e) => ({
      id: e.id,
      player_id: e.player_id,
      player_name: e.players?.display_name,
      admin_id: e.admin_id,
      admin_username: e.admins?.username,
      category: e.category,
      delta: e.delta,
      note: e.note,
      event_date: e.event_date,
      created_at: e.created_at,
    }));

    res.json({ events: result, total: count || 0 });
  } catch (err) {
    console.error("Audit log error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
