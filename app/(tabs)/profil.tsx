import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useProfileStats } from "../../hooks/useProfileStats";
import { Avatar } from "../../components/ui/Avatar";
import { useToast } from "../../context/ToastContext";
import { signOut, getProfilePosts, getMyBirds, getMySongs } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../../components/feed/PostCard";
import { BirdCard } from "../../components/bird/BirdCard";
import { SongCard } from "../../components/feed/SongCard";
import { CommentsSheet } from "../../components/feed/CommentsSheet";
import { Skeleton } from "../../components/ui/Skeleton";
import type { Bird, BirdSong } from "../../types";
import type { FeedPost } from "../../hooks/useFeed";

type Tab = "posts" | "birds" | "songs";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "posts", label: "Posts", icon: "grid-outline" },
  { key: "birds", label: "Oiseaux", icon: "leaf-outline" },
  { key: "songs", label: "Chants", icon: "musical-notes-outline" },
];

function EmptyTab({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="items-center py-12 gap-2">
      <Text className="text-3xl">{icon}</Text>
      <Text className="text-sm text-gray-400">{text}</Text>
    </View>
  );
}

export default function ProfilScreen() {
  const { profile, user, isAuthenticated } = useAuth();
  const stats = useProfileStats(user?.id);
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [songs, setSongs] = useState<BirdSong[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const loadTab = useCallback(async (tab: Tab, userId: string) => {
    setTabLoading(true);
    if (tab === "posts") {
      const { data } = await getProfilePosts(userId);
      if (data) setPosts(data as unknown as FeedPost[]);
    } else if (tab === "birds") {
      const { data } = await getMyBirds(userId);
      if (data) setBirds(data as unknown as Bird[]);
    } else {
      const { data } = await getMySongs(userId);
      if (data) setSongs(data as unknown as BirdSong[]);
    }
    setTabLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) loadTab(activeTab, user.id);
  }, [activeTab, user?.id, loadTab]);

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-5xl mb-4">🐦</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2">Rejoins la communauté</Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Connecte-toi pour suivre tes oiseaux, partager tes chants et rejoindre les éleveurs de Guyane
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          className="bg-accent rounded-xl px-8 py-3.5 w-full items-center mb-3"
        >
          <Text className="text-white font-semibold">Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/auth/register")}
          className="border border-accent rounded-xl px-8 py-3.5 w-full items-center"
        >
          <Text className="text-accent font-semibold">Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleSignOut() {
    await signOut();
    toast("Déconnexion réussie", "info");
  }

  const renderTabContent = () => {
    if (tabLoading) {
      return (
        <View className="px-5 pt-4 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} height={72} borderRadius={16} />)}
        </View>
      );
    }

    if (activeTab === "posts") {
      if (posts.length === 0) return <EmptyTab icon="📝" text="Aucun post" />;
      return (
        <View className="px-4 pt-2">
          {posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              userId={user?.id}
              onLike={() => {}}
              onComment={() => setCommentPostId(p.id)}
            />
          ))}
        </View>
      );
    }

    if (activeTab === "birds") {
      if (birds.length === 0) return <EmptyTab icon="🪺" text="Aucun oiseau" />;
      return (
        <View className="px-4 pt-2">
          <View className="flex-row flex-wrap gap-2.5">
            {birds.map(b => (
              <View key={b.id} style={{ width: "47.5%" }}>
                <BirdCard bird={b} onPress={() => router.push(`/bird/${b.id}`)} />
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (activeTab === "songs") {
      if (songs.length === 0) return <EmptyTab icon="🎵" text="Aucun chant" />;
      return (
        <View className="px-4 pt-2">
          {songs.map(s => <SongCard key={s.id} song={s as any} />)}
        </View>
      );
    }

    return null;
  };

  return (
    <>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="items-center px-5 pt-8 pb-4">
          <Avatar uri={profile?.avatar_url} name={profile?.display_name ?? profile?.username} size={80} />
          <Text className="text-lg font-semibold text-gray-900 mt-3">
            {profile?.display_name ?? profile?.username ?? "Mon profil"}
          </Text>
          {profile?.username && (
            <Text className="text-[12px] text-gray-400 mt-0.5">@{profile.username}</Text>
          )}
          {profile?.bio && (
            <Text className="text-sm text-gray-500 text-center mt-1.5 leading-5">{profile.bio}</Text>
          )}
          {profile?.location && (
            <Text className="text-[12px] text-accent mt-1">📍 {profile.location}</Text>
          )}
          <TouchableOpacity
            onPress={() => router.push("/auth/edit-profile")}
            className="mt-4 flex-row items-center gap-1.5 px-6 py-2.5 rounded-full border border-gray-300 bg-white"
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={14} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-600">Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row border-t border-b border-gray-100">
          {[
            { v: stats?.bird_count ?? "—", l: "oiseaux" },
            { v: stats?.song_count ?? "—", l: "chants" },
            { v: stats?.follower_count ?? "—", l: "abonnés" },
            { v: stats?.win_count ?? "—", l: "victoires" },
          ].map(({ v, l }, i, arr) => (
            <View key={l} className={`flex-1 items-center py-3 ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}>
              <Text className="text-[17px] font-semibold text-gray-900">{v}</Text>
              <Text className="text-[11px] text-gray-400 mt-0.5">{l}</Text>
            </View>
          ))}
        </View>

        {/* Onglets */}
        <View className="flex-row border-b border-gray-100">
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 border-b-2 ${activeTab === tab.key ? "border-accent" : "border-transparent"}`}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={activeTab === tab.key ? "#1D9E75" : "#9CA3AF"}
              />
              <Text className={`text-[13px] ${activeTab === tab.key ? "text-accent font-semibold" : "text-gray-400"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        {/* Déconnexion */}
        <TouchableOpacity onPress={handleSignOut} className="py-4 items-center mt-2">
          <Text className="text-gray-400 text-sm">Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>

      {commentPostId && (
        <CommentsSheet
          postId={commentPostId}
          userId={user?.id}
          visible={!!commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}
    </>
  );
}
