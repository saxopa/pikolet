import { useState, useEffect, useCallback } from "react";
import { getPublicSongs } from "../lib/supabase";
import type { BirdSong, BirdSpecies } from "../types";

export type SongWithMeta = BirdSong & {
  bird: { id: string; name: string; species: string };
  owner: { username: string };
};

export function useChants() {
  const [songs, setSongs] = useState<SongWithMeta[]>([]);
  const [filter, setFilter] = useState<BirdSpecies | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await getPublicSongs();
    if (err) setError(true);
    else if (data) setSongs(data as unknown as SongWithMeta[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all"
    ? songs
    : songs.filter(s => s.bird?.species === filter);

  return { songs: filtered, filter, setFilter, loading, error, refresh: load };
}
