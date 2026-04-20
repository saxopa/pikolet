import { useState, useEffect, useCallback } from "react";
import { supabase, getConversations } from "../lib/supabase";
import type { Conversation } from "../types";

type Participant = { id: string; username: string; display_name: string | null; avatar_url: string | null };

export type ConversationWithParticipants = Conversation & {
  p1: Participant;
  p2: Participant;
};

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    const { data, error: err } = await getConversations(userId);
    if (err) setError(true);
    else if (data) setConversations(data as unknown as ConversationWithParticipants[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Realtime: new message updates conversation preview
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
      }, () => { load(); })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "conversations",
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, load]);

  const getOtherParticipant = useCallback(
    (conv: ConversationWithParticipants): Participant =>
      conv.participant_1 === userId ? conv.p2 : conv.p1,
    [userId]
  );

  return { conversations, loading, error, refresh: load, getOtherParticipant };
}
