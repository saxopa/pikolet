// Type généré pour le client Supabase typé
// À remplacer par le résultat de `supabase gen types typescript` après migration

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          location: string | null;
          bio: string | null;
          is_public: boolean;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      birds: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: "pikolet" | "lorti";
          gender: "male" | "femelle" | null;
          ring_code: string | null;
          birth_date: string | null;
          lineage: string | null;
          status: "en_forme" | "mue" | "reproduction" | "entrainement";
          is_public: boolean;
          father_id: string | null;
          mother_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["birds"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["birds"]["Insert"]>;
      };
      bird_songs: {
        Row: {
          id: string;
          bird_id: string;
          owner_id: string;
          title: string;
          song_type: string | null;
          source_type: "upload" | "youtube";
          storage_url: string | null;
          youtube_url: string | null;
          duration_seconds: number | null;
          play_count: number;
          is_public: boolean;
          recorded_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bird_songs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bird_songs"]["Insert"]>;
      };
      bird_logs: {
        Row: {
          id: string;
          bird_id: string;
          log_type: "entrainement" | "concours" | "alimentation" | "sante" | "note";
          note: string | null;
          weight_g: number | null;
          logged_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bird_logs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["bird_logs"]["Insert"]>;
      };
      bird_pairings: {
        Row: {
          id: string;
          father_id: string;
          mother_id: string;
          pairing_date: string | null;
          eggs_count: number;
          hatchlings_count: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bird_pairings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bird_pairings"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string | null;
          visibility: "public" | "followers" | "private";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      post_songs: {
        Row: { post_id: string; song_id: string };
        Insert: Database["public"]["Tables"]["post_songs"]["Row"];
        Update: Partial<Database["public"]["Tables"]["post_songs"]["Row"]>;
      };
      post_likes: {
        Row: { post_id: string; user_id: string };
        Insert: Database["public"]["Tables"]["post_likes"]["Row"];
        Update: Partial<Database["public"]["Tables"]["post_likes"]["Row"]>;
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_comments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["post_comments"]["Insert"]>;
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["follows"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["follows"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
