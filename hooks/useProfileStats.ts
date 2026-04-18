import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Stats = { bird_count: number; song_count: number; follower_count: number; win_count: number };

export function useProfileStats(userId?: string) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profile_stats" as never)
      .select("bird_count,song_count,follower_count,win_count")
      .eq("id", userId)
      .single()
      .then(({ data }) => { if (data) setStats(data as unknown as Stats); });
  }, [userId]);

  return stats;
}
