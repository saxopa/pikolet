import { createClient } from "@supabase/supabase-js";
import type { Database, Enums } from "../types/database";
import type { Post, Bird, BirdSong, Profile, BirdLog, Competition } from "../types";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ─── Auth ───────────────────────────────────────────────────────────────────

export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

// username/location passés en metadata → trigger handle_new_user crée le profil
export const signUpWithEmail = (
  email: string,
  password: string,
  meta: { username: string; location?: string }
) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { username: meta.username, location: meta.location ?? null } },
  });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ─── Profils ────────────────────────────────────────────────────────────────

export const getProfile = (userId: string) =>
  supabase.from("profiles").select("*").eq("id", userId).single();

export const upsertProfile = (profile: Partial<Profile> & { id: string }) => {
  const { id, ...data } = profile;
  return supabase.from("profiles").update(data as Database["public"]["Tables"]["profiles"]["Update"]).eq("id", id);
};

// ─── Feed ───────────────────────────────────────────────────────────────────

export const getFeedPosts = (limit = 20, offset = 0) =>
  supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, location),
      post_songs(song:bird_songs(*, bird:birds(id, name, species))),
      post_likes(user_id),
      post_comments(count)
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

export const createPost = (
  authorId: string,
  content: string,
  media?: { image_url?: string; audio_url?: string; youtube_url?: string }
) =>
  supabase.from("posts").insert({ author_id: authorId, content, ...media }).select().single();

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

// ─── Profil public ──────────────────────────────────────────────────────────

export const getProfileByUsername = (username: string) =>
  supabase.from("profiles").select("*").eq("username", username).single();

export const getProfilePosts = (userId: string) =>
  supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, location),
      post_songs(song:bird_songs(*, bird:birds(id, name, species))),
      post_likes(user_id),
      post_comments(count)
    `)
    .eq("author_id", userId)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(50);

export const getPublicBirds = (userId: string) =>
  supabase
    .from("birds")
    .select("*")
    .eq("owner_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

export const isFollowing = (followerId: string, followingId: string) =>
  supabase
    .from("follows")
    .select("follower_id")
    .match({ follower_id: followerId, following_id: followingId })
    .maybeSingle();

// ─── Storage audio ──────────────────────────────────────────────────────────

export const uploadBirdSong = async (ownerId: string, fileUri: string, fileName: string, mimeType: string) => {
  const path = `${ownerId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    return { url: null, error: e as Error };
  }
  const { error } = await supabase.storage
    .from("bird-songs")
    .upload(path, blob, { contentType: mimeType || "audio/mpeg", upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from("bird-songs").getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
};

// ─── Follows ────────────────────────────────────────────────────────────────

export const getFollowStatus = (followerId: string, followingId: string) =>
  supabase
    .from("follows")
    .select("status")
    .match({ follower_id: followerId, following_id: followingId })
    .maybeSingle();

export const sendFollowRequest = (followerId: string, followingId: string) =>
  supabase.from("follows").insert({ follower_id: followerId, following_id: followingId, status: "pending" });

export const unfollowUser = (followerId: string, followingId: string) =>
  supabase.from("follows").delete().match({ follower_id: followerId, following_id: followingId });

export const acceptFollowRequest = (followerId: string, followingId: string) =>
  supabase.from("follows").update({ status: "accepted" }).match({ follower_id: followerId, following_id: followingId });

export const rejectFollowRequest = (followerId: string, followingId: string) =>
  supabase.from("follows").delete().match({ follower_id: followerId, following_id: followingId });

export const getPendingRequests = (userId: string) =>
  supabase
    .from("follows")
    .select("follower_id, follower:profiles!follower_id(id, username, display_name, avatar_url)")
    .eq("following_id", userId)
    .eq("status", "pending");

export const getFollowers = (userId: string) =>
  supabase.from("follows").select("follower:profiles!follower_id(*)").eq("following_id", userId).eq("status", "accepted");

export const getFollowing = (userId: string) =>
  supabase.from("follows").select("following:profiles!following_id(*)").eq("follower_id", userId).eq("status", "accepted");

// ─── Suppression ────────────────────────────────────────────────────────────

export const deletePost = (postId: string) =>
  supabase.from("posts").delete().eq("id", postId);

export const deleteBird = (birdId: string) =>
  supabase.from("birds").delete().eq("id", birdId);

export const deleteSong = (songId: string) =>
  supabase.from("bird_songs").delete().eq("id", songId);

// ─── Concours ───────────────────────────────────────────────────────────────

export const createCompetition = (comp: Omit<Competition, "id" | "created_at">) =>
  supabase.from("competitions").insert(comp).select().single();

export const getBirdCompetitions = (birdId: string) =>
  supabase.from("competitions").select("*").eq("bird_id", birdId).order("date", { ascending: false });

export const deleteCompetition = (compId: string) =>
  supabase.from("competitions").delete().eq("id", compId);

// ─── Marketplace ────────────────────────────────────────────────────────────

export const getListings = (category?: string) => {
  let q = supabase
    .from("listings")
    .select("*, seller:profiles(id, username, display_name, avatar_url, location)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);
  if (category && category !== "all") q = q.eq("category", category as Enums<"listing_category">);
  return q;
};

export const getMyListings = (sellerId: string) =>
  supabase
    .from("listings")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

export const getListing = (id: string) =>
  supabase
    .from("listings")
    .select("*, seller:profiles(id, username, display_name, avatar_url, location)")
    .eq("id", id)
    .single();

export const createListing = (listing: {
  seller_id: string;
  title: string;
  description?: string;
  category: Enums<"listing_category">;
  price?: number;
  price_type: Enums<"listing_price_type">;
  location?: string;
  bird_id?: string;
  image_url?: string;
}) =>
  supabase.from("listings").insert(listing).select().single();

export const updateListingStatus = (id: string, status: Enums<"listing_status">) =>
  supabase.from("listings").update({ status }).eq("id", id);

export const deleteListing = (id: string) =>
  supabase.from("listings").delete().eq("id", id);

// ─── Storage post media ──────────────────────────────────────────────────────

export const uploadPostImage = async (userId: string, fileUri: string, fileName: string, mimeType: string) => {
  const path = `${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    return { url: null, error: e as Error };
  }
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, blob, { contentType: mimeType || "image/jpeg", upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
};

export const uploadPostAudio = async (userId: string, fileUri: string, fileName: string, mimeType: string) => {
  const path = `${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    return { url: null, error: e as Error };
  }
  const { error } = await supabase.storage
    .from("post-audio")
    .upload(path, blob, { contentType: mimeType || "audio/mpeg", upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from("post-audio").getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
};

// ─── Storage avatars ────────────────────────────────────────────────────────

export const uploadAvatar = async (userId: string, fileUri: string, fileName: string, mimeType: string) => {
  const path = `${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    return { url: null, error: e as Error };
  }
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: mimeType || "image/jpeg", upsert: true });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
};

// ─── Storage images oiseaux ─────────────────────────────────────────────────

export const uploadBirdImage = async (userId: string, fileUri: string, fileName: string, mimeType: string) => {
  const path = `${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    return { url: null, error: e as Error };
  }
  const { error } = await supabase.storage
    .from("bird-images")
    .upload(path, blob, { contentType: mimeType || "image/jpeg", upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from("bird-images").getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
};
