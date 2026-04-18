import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
import type { Post, Bird, BirdSong, Profile, BirdLog } from "../types";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ─── Auth ───────────────────────────────────────────────────────────────────

export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpWithEmail = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ─── Profils ────────────────────────────────────────────────────────────────

export const getProfile = (userId: string) =>
  supabase.from("profiles").select("*").eq("id", userId).single();

export const upsertProfile = (profile: Partial<Profile> & { id: string }) =>
  supabase.from("profiles").upsert(profile as Database["public"]["Tables"]["profiles"]["Insert"]);

// ─── Feed ───────────────────────────────────────────────────────────────────

export const getFeedPosts = (limit = 20, offset = 0) =>
  supabase
    .from("posts")
    .select(`
      *,
      author:profiles(id, username, display_name, avatar_url, location),
      post_songs(song:bird_songs(*, bird:birds(id, name, species))),
      post_likes(user_id)
    `)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

export const toggleLike = async (postId: string, userId: string, liked: boolean) => {
  if (liked) {
    return supabase.from("post_likes").delete().match({ post_id: postId, user_id: userId });
  }
  return supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
};

export const getPostComments = (postId: string) =>
  supabase
    .from("post_comments")
    .select("*, author:profiles(username, display_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

export const addComment = (postId: string, authorId: string, content: string) =>
  supabase.from("post_comments").insert({ post_id: postId, author_id: authorId, content });

export const createPost = (authorId: string, content: string) =>
  supabase.from("posts").insert({ author_id: authorId, content }).select().single();

export const linkSongToPost = (postId: string, songId: string) =>
  supabase.from("post_songs").insert({ post_id: postId, song_id: songId });

// ─── Oiseaux ────────────────────────────────────────────────────────────────

export const getMyBirds = (ownerId: string) =>
  supabase
    .from("birds")
    .select("*, logs:bird_logs(id, log_type, logged_at)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

export const getBird = (birdId: string) =>
  supabase
    .from("birds")
    .select("*, owner:profiles(username, display_name, avatar_url)")
    .eq("id", birdId)
    .single();

export const createBird = (bird: Omit<Bird, "id" | "created_at">) =>
  supabase.from("birds").insert(bird).select().single();

export const updateBird = (birdId: string, data: Partial<Bird>) =>
  supabase.from("birds").update(data).eq("id", birdId);

export const getBirdLogs = (birdId: string) =>
  supabase
    .from("bird_logs")
    .select("*")
    .eq("bird_id", birdId)
    .order("logged_at", { ascending: false });

export const addBirdLog = (log: Omit<BirdLog, "id">) =>
  supabase.from("bird_logs").insert(log);

export const getBirdSongs = (birdId: string) =>
  supabase
    .from("bird_songs")
    .select("*")
    .eq("bird_id", birdId)
    .order("created_at", { ascending: false });

// ─── Chants ─────────────────────────────────────────────────────────────────

export const getPublicSongs = (species?: string) => {
  let q = supabase
    .from("bird_songs")
    .select("*, bird:birds(id, name, species), owner:profiles(username)")
    .eq("is_public", true)
    .order("play_count", { ascending: false });
  if (species) q = q.eq("bird.species", species);
  return q;
};

export const getMySongs = (ownerId: string) =>
  supabase
    .from("bird_songs")
    .select("*, bird:birds(id, name, species)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

export const incrementPlayCount = (songId: string) =>
  supabase.rpc("increment_play_count", { song_id: songId });

export const addSong = (song: Omit<BirdSong, "id" | "created_at" | "play_count">) =>
  supabase.from("bird_songs").insert({ ...song, play_count: 0 }).select().single();

// ─── Follows ────────────────────────────────────────────────────────────────

export const toggleFollow = async (followerId: string, followingId: string, following: boolean) => {
  if (following) {
    return supabase.from("follows").delete().match({ follower_id: followerId, following_id: followingId });
  }
  return supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
};

export const getFollowers = (userId: string) =>
  supabase.from("follows").select("follower:profiles!follower_id(*)").eq("following_id", userId);

export const getFollowing = (userId: string) =>
  supabase.from("follows").select("following:profiles!following_id(*)").eq("follower_id", userId);
