// Run with: node scripts/seed.js
import "dotenv/config";
import { supabase } from "../server/db.js";

const players = [
  { display_name: "Ahmed Hassan" },
  { display_name: "Layla Khoury" },
  { display_name: "Omar Saleh" },
  { display_name: "Sara Nasser" },
  { display_name: "Khalid Mansour" },
  { display_name: "Dania Fares" },
];

async function seed() {
  console.log("Seeding players...");

  for (const p of players) {
    const { data: player, error: pErr } = await supabase
      .from("players")
      .insert({ display_name: p.display_name })
      .select()
      .single();

    if (pErr) {
      console.error(`Error creating ${p.display_name}:`, pErr);
      continue;
    }

    const cats = ["AI", "Cyber", "Web"];
    const scores = cats.map((category) => ({
      player_id: player.id,
      category,
      live_pts: Math.floor(Math.random() * 500),
      biweekly_pts: Math.floor(Math.random() * 300),
      monthly_pts: Math.floor(Math.random() * 400),
    }));

    const { error: sErr } = await supabase
      .from("leaderboard_scores")
      .insert(scores);

    if (sErr) {
      console.error(`Error creating scores for ${p.display_name}:`, sErr);
    } else {
      console.log(`  ✓ ${p.display_name}`);
    }
  }

  console.log("Done!");
}

seed().catch(console.error);
