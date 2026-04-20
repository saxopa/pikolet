import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, getMessages, sendMessage, markMessagesRead } from "../lib/supabase";
import type { Message } from "../types";

export function useMessages(conversationId: string, userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const seenIds = useRef(new Set<string>());

  const load = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await getMessages(conversationId);
    if (data) {
      setMessages(data as unknown as Message[]);
      data.forEach((m: any) => seenIds.current.add(m.id));
    }
    setLoading(false);
    // Mark received messages as read
    if (userId) markMessagesRead(conversationId, userId);
  }, [conversationId, userId]);

  useEffect(() => { load(); }, [load]);

  // Realtime: listen for new messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (!seenIds.current.has(msg.id)) {
          seenIds.current.add(msg.id);
          setMessages(prev => [...prev, msg]);
          // Mark as read if we're the recipient
          if (userId && msg.sender_id !== userId) {
            markMessagesRead(conversationId, userId);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, userId]);

  const send = useCallback(async (content: string) => {
    if (!content.trim() || !userId || !conversationId) return false;
    setSending(true);
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    seenIds.current.add(optimistic.id);

    const { data, error } = await sendMessage(conversationId, userId, content.trim());
    if (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      seenIds.current.delete(optimistic.id);
      setSending(false);
      return false;
    }
    // Replace optimistic with real
    if (data) {
      const real = data as unknown as Message;
      seenIds.current.add(real.id);
      setMessages(prev => prev.map(m =>
        m.id === optimistic.id ? real : m
      ));
    }
    setSending(false);
    return true;
  }, [conversationId, userId]);

  return { messages, loading, sending, send, refresh: load };
}
