export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  is_public: boolean;
  avatar_url: string | null;
  created_at: string;
}

export type BirdSpecies = "pikolet" | "lorti";
export type BirdGender = "male" | "femelle";
export type BirdStatus = "en_forme" | "mue" | "reproduction" | "entrainement";

export interface Bird {
  id: string;
  owner_id: string;
  name: string;
  species: BirdSpecies;
  gender: BirdGender | null;
  ring_code: string | null;
  birth_date: string | null;
  lineage: string | null;
  status: BirdStatus;
  is_public: boolean;
  image_url: string | null;
  father_id: string | null;
  mother_id: string | null;
  created_at: string;
}

export type SongType = "chant_libre" | "cage_collee" | "femelle" | "stimulation";
export type SourceType = "upload" | "youtube" | "storage";

export interface BirdSong {
  id: string;
  bird_id: string;
  owner_id: string;
  title: string;
  song_type: SongType | null;
  source_type: SourceType;
  storage_url: string | null;
  youtube_url: string | null;
  duration_seconds: number | null;
  play_count: number;
  is_public: boolean;
  recorded_at: string | null;
  created_at: string;
}

export type LogType = "entrainement" | "concours" | "alimentation" | "sante" | "note";

export interface BirdLog {
  id: string;
  bird_id: string;
  log_type: LogType;
  note: string | null;
  weight_g: number | null;
  logged_at: string;
}

export interface BirdPairing {
  id: string;
  father_id: string;
  mother_id: string;
  pairing_date: string | null;
  eggs_count: number;
  hatchlings_count: number;
  notes: string | null;
  created_at: string;
}

export type Visibility = "public" | "followers" | "private";

export interface Post {
  id: string;
  author_id: string;
  content: string | null;
  visibility: Visibility;
  created_at: string;
}

export interface PostSong {
  post_id: string;
  song_id: string;
}

export interface PostLike {
  post_id: string;
  user_id: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  status: "pending" | "accepted";
  created_at: string;
}

// Jointures fréquentes
export type SongWithBird = BirdSong & { bird: Bird };
export type PostWithAuthor = Post & { author: Profile };
export type PostFull = Post & {
  author: Profile;
  songs: SongWithBird[];
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};
