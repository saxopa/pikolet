import { useCallback } from "react";
import { toggleLike } from "../lib/supabase";
import type { FeedPost } from "./useFeed";

export function usePostLike(
  userId: string | undefined,
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>
) {
  return useCallback(async (postId: string) => {
    if (!userId) return;
    let wasLiked = false;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      wasLiked = p.post_likes.some(l => l.user_id === userId);
      return {
        ...p,
        post_likes: wasLiked
          ? p.post_likes.filter(l => l.user_id !== userId)
          : [...p.post_likes, { user_id: userId }],
      };
    }));
    await toggleLike(postId, userId, wasLiked);
  }, [userId, setPosts]);
}
