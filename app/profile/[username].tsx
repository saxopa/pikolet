import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  getProfileByUsername, getProfilePosts, getPublicBirds, getMySongs,
  toggleFollow, isFollowing as checkFollowing,
} from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useProfileStats } from "../../hooks/useProfileStats";
import { Avatar } from "../../components/ui/Avatar";
import { PostCard } from "../../components/feed/PostCard";
import { BirdCard } from "../../components/bird/BirdCard";
import { SongCard } from "../../components/feed/SongCard";
import { CommentsSheet } from "../../components/feed/CommentsSheet";
import { Skeleton } from "../../components/ui/Skeleton";
import type { Profile, Bird, BirdSong } from "../../types";
import type { FeedPost } from "../../hooks/useFeed";

type Tab = "posts" | "birds" | "songs";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "posts", label: "Posts", icon: "grid-outline" },
  { key: "birds", label: "Oiseaux", icon: "leaf-outline" },
  { key: "songs", label: "Chants", icon: "musical-notes-outline" },
];

function ProfileSkeleton() {
  return (
    <View className="px-5 pt-8 pb-4 items-center gap-3">
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={140} height={16} />
      <Skeleton width={90} height={12} />
      <Skeleton width={200} height={11} />
    </View>
  );
}

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [following, setFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [songs, setSongs] = useState<BirdSong[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const stats = useProfileStats(profile?.id);

  // Chargement profil + état follow
  useEffect(() => {
    async function load() {
      setLoadingProfile(true);
      const { data } = await getProfileByUsername(username);
      if (data) {
        setProfile(data as Profile);
        if (user) {
          const { data: f } = await checkFollowing(user.id, data.id);
          setFollowing(!!f);
        }
      }
      setLoadingProfile(false);
    }
    load();
  }, [username, user]);

  // Chargement contenu onglet
  const loadTab = useCallback(async (tab: Tab, profileId: string) => {
    setTabLoading(true);
    if (tab === "posts") {
      const { data } = await getProfilePosts(profileId);
      if (data) setPosts(data as unknown as FeedPost[]);
    } else if (tab === "birds") {
      const { data } = await getPublicBirds(profileId);
      if (data) setBirds(data as unknown as Bird[]);
    } else {
      const { data } = await getMySongs(profileId);
      if (data) setSongs(data as unknown as BirdSong[]);
    }
    setTabLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.id) loadTab(activeTab, profile.id);
  }, [activeTab, profile?.id, loadTab]);

  async function handleFollow() {
    if (!user || !profile) return;
    setFollowing(f => !f);
    await toggleFollow(user.id, profile.id, following);
  }

  const isSelf = user?.id === profile?.id;

  const renderTabContent = () => {
    if (tabLoading) {
      return (
        <View className="px-5 pt-4 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} height={72} borderRadius={16} />)}
        </View>
      );
    }

    if (activeTab === "posts") {
      if (posts.length === 0) return <EmptyTab icon="📝" text="Aucun post public" />;
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
      if (birds.length === 0) return <EmptyTab icon="🪺" text="Aucun oiseau public" />;
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
      if (songs.length === 0) return <EmptyTab icon="🎵" text="Aucun chant public" />;
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
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header profil */}
        {loadingProfile ? (
          <ProfileSkeleton />
        ) : !profile ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-400">Profil introuvable</Text>
          </View>
        ) : (
          <View className="items-center px-5 pt-8 pb-5">
            <Avatar uri={profile.avatar_url} name={profile.display_name ?? profile.username} size={84} />
            <Text className="text-xl font-semibold text-gray-900 mt-3">
              {profile.display_name ?? profile.username}
            </Text>
            <Text className="text-[13px] text-gray-400 mt-0.5">@{profile.username}</Text>
            {profile.bio && (
              <Text className="text-sm text-gray-500 text-center mt-2 leading-5 px-4">
                {profile.bio}
              </Text>
            )}
            {profile.location && (
              <Text className="text-[12px] text-accent mt-1.5">📍 {profile.location}</Text>
            )}

            {!isSelf && user && (
              <TouchableOpacity
                onPress={handleFollow}
                className={`mt-4 flex-row items-center gap-1.5 px-6 py-2.5 rounded-full border ${following ? "border-gray-300 bg-white" : "border-accent bg-accent"}`}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={following ? "checkmark" : "person-add-outline"}
                  size={14}
                  color={following ? "#6B7280" : "white"}
                />
                <Text className={`text-sm font-semibold ${following ? "text-gray-600" : "text-white"}`}>
                  {following ? "Abonné" : "Suivre"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats */}
        {profile && (
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
        )}

        {/* Onglets */}
        {profile && (
          <>
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
          </>
        )}
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

function EmptyTab({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="items-center py-12 gap-2">
      <Text className="text-3xl">{icon}</Text>
      <Text className="text-sm text-gray-400">{text}</Text>
    </View>
  );
}
