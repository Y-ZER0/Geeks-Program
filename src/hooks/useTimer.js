import { useState, useEffect } from "react";

const DEFAULT_SECONDS = 14 * 86400 + 7 * 3600 + 23 * 60;

export function useTimer(initialSeconds = DEFAULT_SECONDS) {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const days = Math.floor(secs / 86400);
  const hrs = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;

  return { days, hrs, mins, ss, totalSeconds: secs };
}
