import { useState, useEffect, useCallback } from "react";
import { getFeedPosts, toggleLike } from "../lib/supabase";

export type FeedPost = {
  id: string;
  content: string | null;
  created_at: string;
  author: { id: string; username: string; display_name: string | null; avatar_url: string | null; location: string | null };
  post_songs: Array<{ song: { id: string; title: string; song_type: string | null; source_type: string; youtube_url: string | null; storage_url: string | null; duration_seconds: number | null; play_count: number; bird: { id: string; name: string; species: string } } }>;
  post_likes: Array<{ user_id: string }>;
};

export function useFeed(userId?: string) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await getFeedPosts();
    if (!error && data) setPosts(data as unknown as FeedPost[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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

  return { posts, loading, refreshing, refresh: () => { setRefreshing(true); load(true); }, like };
}
