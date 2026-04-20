export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bird_logs: {
        Row: {
          bird_id: string
          id: string
          log_type: string | null
          logged_at: string | null
          note: string | null
          weight_g: number | null
        }
        Insert: {
          bird_id: string
          id?: string
          log_type?: string | null
          logged_at?: string | null
          note?: string | null
          weight_g?: number | null
        }
        Update: {
          bird_id?: string
          id?: string
          log_type?: string | null
          logged_at?: string | null
          note?: string | null
          weight_g?: number | null
        }
        Relationships: [{ foreignKeyName: "bird_logs_bird_id_fkey"; columns: ["bird_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] }]
      }
      bird_pairings: {
        Row: { created_at: string | null; eggs_count: number | null; father_id: string; hatchlings_count: number | null; id: string; mother_id: string; notes: string | null; pairing_date: string | null }
        Insert: { created_at?: string | null; eggs_count?: number | null; father_id: string; hatchlings_count?: number | null; id?: string; mother_id: string; notes?: string | null; pairing_date?: string | null }
        Update: { created_at?: string | null; eggs_count?: number | null; father_id?: string; hatchlings_count?: number | null; id?: string; mother_id?: string; notes?: string | null; pairing_date?: string | null }
        Relationships: [
          { foreignKeyName: "bird_pairings_father_id_fkey"; columns: ["father_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "bird_pairings_mother_id_fkey"; columns: ["mother_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
        ]
      }
      bird_songs: {
        Row: { bird_id: string; created_at: string | null; duration_seconds: number | null; id: string; is_public: boolean | null; owner_id: string; play_count: number | null; recorded_at: string | null; song_type: string | null; source_type: string; storage_url: string | null; title: string; youtube_url: string | null }
        Insert: { bird_id: string; created_at?: string | null; duration_seconds?: number | null; id?: string; is_public?: boolean | null; owner_id: string; play_count?: number | null; recorded_at?: string | null; song_type?: string | null; source_type: string; storage_url?: string | null; title: string; youtube_url?: string | null }
        Update: { bird_id?: string; created_at?: string | null; duration_seconds?: number | null; id?: string; is_public?: boolean | null; owner_id?: string; play_count?: number | null; recorded_at?: string | null; song_type?: string | null; source_type?: string; storage_url?: string | null; title?: string; youtube_url?: string | null }
        Relationships: [
          { foreignKeyName: "bird_songs_bird_id_fkey"; columns: ["bird_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "bird_songs_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      birds: {
        Row: { birth_date: string | null; created_at: string | null; father_id: string | null; gender: string | null; id: string; image_url: string | null; is_public: boolean | null; lineage: string | null; mother_id: string | null; name: string; owner_id: string; ring_code: string | null; species: string | null; status: string | null }
        Insert: { birth_date?: string | null; created_at?: string | null; father_id?: string | null; gender?: string | null; id?: string; image_url?: string | null; is_public?: boolean | null; lineage?: string | null; mother_id?: string | null; name: string; owner_id: string; ring_code?: string | null; species?: string | null; status?: string | null }
        Update: { birth_date?: string | null; created_at?: string | null; father_id?: string | null; gender?: string | null; id?: string; image_url?: string | null; is_public?: boolean | null; lineage?: string | null; mother_id?: string | null; name?: string; owner_id?: string; ring_code?: string | null; species?: string | null; status?: string | null }
        Relationships: [
          { foreignKeyName: "birds_father_id_fkey"; columns: ["father_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "birds_mother_id_fkey"; columns: ["mother_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "birds_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      competitions: {
        Row: { bird_id: string; created_at: string; date: string; id: string; location: string | null; name: string; notes: string | null; owner_id: string; rank: number }
        Insert: { bird_id: string; created_at?: string; date: string; id?: string; location?: string | null; name: string; notes?: string | null; owner_id: string; rank?: number }
        Update: { bird_id?: string; created_at?: string; date?: string; id?: string; location?: string | null; name?: string; notes?: string | null; owner_id?: string; rank?: number }
        Relationships: [
          { foreignKeyName: "competitions_bird_id_fkey"; columns: ["bird_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "competitions_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      follows: {
        Row: { created_at: string | null; follower_id: string; following_id: string; status: string }
        Insert: { created_at?: string | null; follower_id: string; following_id: string; status?: string }
        Update: { created_at?: string | null; follower_id?: string; following_id?: string; status?: string }
        Relationships: [
          { foreignKeyName: "follows_follower_id_fkey"; columns: ["follower_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "follows_following_id_fkey"; columns: ["following_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      listings: {
        Row: {
          bird_id: string | null
          category: Database["public"]["Enums"]["listing_category"]
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number | null
          price_type: Database["public"]["Enums"]["listing_price_type"]
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
        }
        Insert: {
          bird_id?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
        }
        Update: {
          bird_id?: string | null
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
        }
        Relationships: [
          { foreignKeyName: "listings_bird_id_fkey"; columns: ["bird_id"]; isOneToOne: false; referencedRelation: "birds"; referencedColumns: ["id"] },
          { foreignKeyName: "listings_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      post_comments: {
        Row: { author_id: string; content: string; created_at: string | null; id: string; post_id: string }
        Insert: { author_id: string; content: string; created_at?: string | null; id?: string; post_id: string }
        Update: { author_id?: string; content?: string; created_at?: string | null; id?: string; post_id?: string }
        Relationships: [
          { foreignKeyName: "post_comments_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "post_comments_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
        ]
      }
      post_likes: {
        Row: { post_id: string; user_id: string }
        Insert: { post_id: string; user_id: string }
        Update: { post_id?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "post_likes_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "post_likes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      post_songs: {
        Row: { post_id: string; song_id: string }
        Insert: { post_id: string; song_id: string }
        Update: { post_id?: string; song_id?: string }
        Relationships: [
          { foreignKeyName: "post_songs_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "post_songs_song_id_fkey"; columns: ["song_id"]; isOneToOne: false; referencedRelation: "bird_songs"; referencedColumns: ["id"] },
        ]
      }
      posts: {
        Row: { audio_url: string | null; author_id: string; content: string | null; created_at: string | null; id: string; image_url: string | null; visibility: string | null; youtube_url: string | null }
        Insert: { audio_url?: string | null; author_id: string; content?: string | null; created_at?: string | null; id?: string; image_url?: string | null; visibility?: string | null; youtube_url?: string | null }
        Update: { audio_url?: string | null; author_id?: string; content?: string | null; created_at?: string | null; id?: string; image_url?: string | null; visibility?: string | null; youtube_url?: string | null }
        Relationships: [{ foreignKeyName: "posts_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row: { avatar_url: string | null; bio: string | null; created_at: string | null; display_name: string | null; id: string; is_public: boolean | null; location: string | null; username: string }
        Insert: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; display_name?: string | null; id: string; is_public?: boolean | null; location?: string | null; username: string }
        Update: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; display_name?: string | null; id?: string; is_public?: boolean | null; location?: string | null; username?: string }
        Relationships: []
      }
    }
    Views: {
      profile_stats: {
        Row: { bird_count: number | null; follower_count: number | null; id: string | null; song_count: number | null; win_count: number | null }
        Relationships: []
      }
    }
    Functions: {
      increment_play_count: { Args: { song_id: string }; Returns: undefined }
    }
    Enums: {
      listing_category: "oiseau" | "materiel" | "nourriture" | "autre"
      listing_price_type: "fixed" | "negotiable" | "free"
      listing_status: "active" | "sold" | "reserved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]
