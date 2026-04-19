import { useState, useEffect, useCallback, useRef } from "react";
import { getFeedPosts, toggleLike } from "../lib/supabase";

export type FeedPost = {
  id: string;
  content: string | null;
  created_at: string;
  author: { id: string; username: string; display_name: string | null; avatar_url: string | null; location: string | null };
  post_songs: Array<{ song: { id: string; title: string; song_type: string | null; source_type: string; youtube_url: string | null; storage_url: string | null; duration_seconds: number | null; play_count: number; bird: { id: string; name: string; species: string } } }>;
  post_likes: Array<{ user_id: string }>;
};

const PAGE_SIZE = 12;

export function useFeed(userId?: string) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const loadPage = useCallback(async (reset: boolean, silent = false) => {
    if (reset) {
      offsetRef.current = 0;
      if (!silent) setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const { data, error } = await getFeedPosts(PAGE_SIZE, offsetRef.current);
    if (!error && data) {
      const next = data as unknown as FeedPost[];
      if (reset) setPosts(next);
      else setPosts(prev => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
      offsetRef.current += next.length;
    }
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, []);

  // Chargement initial uniquement
  useEffect(() => { loadPage(true); }, [loadPage]);

  // Refresh memoized exposé pour useFocusEffect
  const refresh = useCallback(() => {
    setRefreshing(true);
    loadPage(true, true);
  }, [loadPage]);

  const like = useCallback(async (postId: string) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const liked = post.post_likes.some(l => l.user_id === userId);
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      post_likes: liked
        ? p.post_likes.filter(l => l.user_id !== userId)
        : [...p.post_likes, { user_id: userId }],
    }));
    await toggleLike(postId, userId, liked);
  }, [posts, userId]);

  return {
    posts, loading, refreshing, loadingMore, hasMore,
    refresh,
    loadMore: () => { if (!loadingMore && hasMore) loadPage(false); },
    like,
  };
}
