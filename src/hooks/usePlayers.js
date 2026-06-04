import { useState, useEffect, useCallback, useRef } from "react";

export function usePlayers({ players: staticPlayers, fetchUrl, autoRefreshMs, tf, cat } = {}) {
  const [players, setPlayers] = useState(staticPlayers || []);
  const [loading, setLoading] = useState(!staticPlayers);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (staticPlayers) return;
    if (!fetchUrl) return;

    // Abort in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch(fetchUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`API responded with ${res.status} ${res.statusText}`);
      const data = await res.json();
      setPlayers(Array.isArray(data) ? data : data.players || data.result || []);
      setFetchedAt(new Date());
      setError(null);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchUrl, staticPlayers]);

  useEffect(() => {
    if (staticPlayers) {
      setPlayers(staticPlayers);
      setLoading(false);
      setError(null);
      return;
    }
    load(false);
  }, [load, staticPlayers, tf, cat]);

  useEffect(() => {
    if (!autoRefreshMs || staticPlayers) return;
    const t = setInterval(() => load(true), autoRefreshMs);
    return () => clearInterval(t);
  }, [load, autoRefreshMs, staticPlayers]);

  return { players, loading, error, refreshing, fetchedAt, refetch: () => load(true) };
}
