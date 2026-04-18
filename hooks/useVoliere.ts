import { useState, useEffect, useCallback } from "react";
import { getMyBirds, getBird, getBirdLogs, getMySongs } from "../lib/supabase";
import type { Bird, BirdLog, BirdSong } from "../types";

export function useVoliere(ownerId?: string) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    const { data } = await getMyBirds(ownerId);
    if (data) setBirds(data as unknown as Bird[]);
    setLoading(false);
  }, [ownerId]);

  useEffect(() => { load(); }, [load]);

  return { birds, loading, refresh: load };
}

export function useBirdDetail(birdId: string) {
  const [bird, setBird] = useState<Bird | null>(null);
  const [logs, setLogs] = useState<BirdLog[]>([]);
  const [songs, setSongs] = useState<BirdSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [birdRes, logsRes, songsRes] = await Promise.all([
        getBird(birdId),
        getBirdLogs(birdId),
        getMySongs(birdId),
      ]);
      if (birdRes.data) setBird(birdRes.data as unknown as Bird);
      if (logsRes.data) setLogs(logsRes.data as BirdLog[]);
      if (songsRes.data) setSongs(songsRes.data as unknown as BirdSong[]);
      setLoading(false);
    }
    load();
  }, [birdId]);

  return { bird, logs, songs, loading };
}
