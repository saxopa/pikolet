export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; display_name: string | null; location: string | null; bio: string | null; is_public: boolean; avatar_url: string | null; created_at: string };
        Insert: { id: string; username: string; display_name?: string | null; location?: string | null; bio?: string | null; is_public?: boolean; avatar_url?: string | null; created_at?: string };
        Update: { id?: string; username?: string; display_name?: string | null; location?: string | null; bio?: string | null; is_public?: boolean; avatar_url?: string | null; created_at?: string };
        Relationships: [];
      };
      birds: {
        Row: { id: string; owner_id: string; name: string; species: string; gender: string | null; ring_code: string | null; birth_date: string | null; lineage: string | null; status: string; is_public: boolean; image_url: string | null; father_id: string | null; mother_id: string | null; created_at: string };
        Insert: { id?: string; owner_id: string; name: string; species: string; gender?: string | null; ring_code?: string | null; birth_date?: string | null; lineage?: string | null; status?: string; is_public?: boolean; image_url?: string | null; father_id?: string | null; mother_id?: string | null; created_at?: string };
        Update: { id?: string; owner_id?: string; name?: string; species?: string; gender?: string | null; ring_code?: string | null; birth_date?: string | null; lineage?: string | null; status?: string; is_public?: boolean; image_url?: string | null; father_id?: string | null; mother_id?: string | null; created_at?: string };
        Relationships: [];
      };
      bird_songs: {
        Row: { id: string; bird_id: string; owner_id: string; title: string; song_type: string | null; source_type: string; storage_url: string | null; youtube_url: string | null; duration_seconds: number | null; play_count: number; is_public: boolean; recorded_at: string | null; created_at: string };
        Insert: { id?: string; bird_id: string; owner_id: string; title: string; song_type?: string | null; source_type: string; storage_url?: string | null; youtube_url?: string | null; duration_seconds?: number | null; play_count?: number; is_public?: boolean; recorded_at?: string | null; created_at?: string };
        Update: { id?: string; bird_id?: string; owner_id?: string; title?: string; song_type?: string | null; source_type?: string; storage_url?: string | null; youtube_url?: string | null; duration_seconds?: number | null; play_count?: number; is_public?: boolean; recorded_at?: string | null; created_at?: string };
        Relationships: [];
      };
      bird_logs: {
        Row: { id: string; bird_id: string; log_type: string; note: string | null; weight_g: number | null; logged_at: string };
        Insert: { id?: string; bird_id: string; log_type: string; note?: string | null; weight_g?: number | null; logged_at?: string };
        Update: { id?: string; bird_id?: string; log_type?: string; note?: string | null; weight_g?: number | null; logged_at?: string };
        Relationships: [];
      };
      bird_pairings: {
        Row: { id: string; father_id: string; mother_id: string; pairing_date: string | null; eggs_count: number; hatchlings_count: number; notes: string | null; created_at: string };
        Insert: { id?: string; father_id: string; mother_id: string; pairing_date?: string | null; eggs_count?: number; hatchlings_count?: number; notes?: string | null; created_at?: string };
        Update: { id?: string; father_id?: string; mother_id?: string; pairing_date?: string | null; eggs_count?: number; hatchlings_count?: number; notes?: string | null; created_at?: string };
        Relationships: [];
      };
      posts: {
        Row: { id: string; author_id: string; content: string | null; visibility: string; image_url: string | null; audio_url: string | null; youtube_url: string | null; created_at: string };
        Insert: { id?: string; author_id: string; content?: string | null; visibility?: string; image_url?: string | null; audio_url?: string | null; youtube_url?: string | null; created_at?: string };
        Update: { id?: string; author_id?: string; content?: string | null; visibility?: string; image_url?: string | null; audio_url?: string | null; youtube_url?: string | null; created_at?: string };
        Relationships: [];
      };
      post_songs: {
        Row: { post_id: string; song_id: string };
        Insert: { post_id: string; song_id: string };
        Update: { post_id?: string; song_id?: string };
        Relationships: [];
      };
      post_likes: {
        Row: { post_id: string; user_id: string };
        Insert: { post_id: string; user_id: string };
        Update: { post_id?: string; user_id?: string };
        Relationships: [];
      };
      post_comments: {
        Row: { id: string; post_id: string; author_id: string; content: string; created_at: string };
        Insert: { id?: string; post_id: string; author_id: string; content: string; created_at?: string };
        Update: { id?: string; post_id?: string; author_id?: string; content?: string; created_at?: string };
        Relationships: [];
      };
      follows: {
        Row: { follower_id: string; following_id: string; status: string; created_at: string };
        Insert: { follower_id: string; following_id: string; status?: string; created_at?: string };
        Update: { follower_id?: string; following_id?: string; status?: string; created_at?: string };
        Relationships: [];
      };
      competitions: {
        Row: { id: string; bird_id: string; owner_id: string; name: string; location: string | null; date: string; rank: number; notes: string | null; created_at: string };
        Insert: { id?: string; bird_id: string; owner_id: string; name: string; location?: string | null; date: string; rank?: number; notes?: string | null; created_at?: string };
        Update: { id?: string; bird_id?: string; owner_id?: string; name?: string; location?: string | null; date?: string; rank?: number; notes?: string | null; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_play_count: { Args: { song_id: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
  };
}
