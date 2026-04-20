import { useState, useEffect, useCallback } from "react";
import { getSongFavorites, toggleSongFavorite } from "../lib/supabase";

export function useSongFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await getSongFavorites(userId);
    if (data) setFavorites(new Set(data.map((f: { song_id: string }) => f.song_id)));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (songId: string) => {
    if (!userId) return;
    const isFav = favorites.has(songId);
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(songId) : next.add(songId);
      return next;
    });
    const { error } = await toggleSongFavorite(userId, songId, isFav);
    if (error) {
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(songId) : next.delete(songId);
        return next;
      });
    }
  }, [userId, favorites]);

  return { favorites, toggle, refresh: load };
}
