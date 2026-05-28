# Sanity Schema & Configuration

This folder contains the Sanity CMS configuration and schema definitions for the Geeks Program Leaderboard.

## Files

- **`player.js`** — Player schema definition for Sanity Studio
  - Defines player profile, avatars, and score fields
  - Tier progression is auto-computed on the frontend from these values
  - Supports three timeframes: Live, 2-Week, Monthly

- **`sanity.config.js`** (if you have a Sanity Studio) — Sanity project configuration

## Integration with Sanity Studio

If you're using a Sanity Studio project, add the player schema:

```javascript
// In your Sanity studio's schemaTypes/index.js:
import player from "./player";

export const schemaTypes = [player];
```

## Schema Fields

### Profile

- **Username** (slug) — Leaderboard handle (e.g., `geek_prime`)
- **Display Name** (string) — Full name shown on leaderboard
- **Initials** (string) — 1–2 uppercase chars for avatar
- **Avatar Color** (string) — Hex color for avatar ring (#RRGGBB)

### Scores

Each timeframe (Live, 2-Week, Monthly) has three categories:

- **AI Points** (number) — AI/ML track score
- **Cybersecurity Points** (number) — Cybersecurity track score
- **Web Dev Points** (number) — Web development track score

## Tier Progression (Auto-Computed)

Points → Tier:

- 0–74: **Bronze** 🥉
- 75–149: **Silver** 🥈
- 150–299: **Gold** 🥇
- 300–599: **Platinum** 💎
- 600–899: **Geek** ⚡
- 900+: **Geeks Master** 🏆

Tiers and colors are calculated on the **frontend** based on player total points. Update only the point values in the schema.
