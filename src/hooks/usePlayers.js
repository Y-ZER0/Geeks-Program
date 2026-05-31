/**
 * usePlayers Hook
 * 
 * Manages fetching, loading, and auto-refreshing player data from Sanity
 * Transforms raw Sanity data by:
 *  - Extracting initials from name
 *  - Calculating rolling 2-week and monthly scores from scoreHistory
 */

import { useState, useEffect, useCallback } from "react";
import { buildSanityUrl } from "../config/sanity";
import { calculateTimeframeScores } from "../utils/scoring";

/**
 * Extract initials from a full name
 * "John Doe" → "JD", "Alice" → "A", "Bob Brown" → "BB"
 */
const extractInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Transform raw Sanity data to frontend data structure
 */
const transformPlayer = (rawPlayer) => {
  const initials = extractInitials(rawPlayer.name);
  const w2Scores = calculateTimeframeScores(rawPlayer.scoreHistory, 'w2');
  const moScores = calculateTimeframeScores(rawPlayer.scoreHistory, 'mo');

  return {
    id: rawPlayer.id,
    name: rawPlayer.name,
    ini: initials,
    pts: {
      live: rawPlayer.live,
      w2: w2Scores,
      mo: moScores,
    },
  };
};

export function usePlayers(autoRefreshMs) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const url = buildSanityUrl();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sanity API responded with ${res.status} ${res.statusText}`);
      const { result } = await res.json();
      
      // Transform each player
      const transformed = (result ?? []).map(transformPlayer);
      setPlayers(transformed);
      setFetchedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    load(false);
  }, [load]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshMs) return;
    const t = setInterval(() => load(true), autoRefreshMs);
    return () => clearInterval(t);
  }, [load, autoRefreshMs]);

  return { players, loading, error, refreshing, fetchedAt, refetch: () => load(true) };
}
