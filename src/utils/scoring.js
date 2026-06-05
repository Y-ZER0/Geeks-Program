export function score(player, timeframe, category) {
  const d = player.pts?.[timeframe];
  if (!d) return 0;
  return category === "All" ? Math.max(d.AI, d.Cy, d.Wb) : d[category];
}

export function calcTotalTasks(players, timeframe, category) {
  return players.reduce((a, p) => a + Math.floor(score(p, timeframe, category) / 15), 0);
}
