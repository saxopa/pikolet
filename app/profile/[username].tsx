import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { supabase, toggleFollow } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useProfileStats } from "../../hooks/useProfileStats";
import { Avatar } from "../../components/ui/Avatar";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import type { Profile } from "../../types";

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const stats = useProfileStats(profile?.id);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (data) {
        setProfile(data as Profile);
        if (user) {
          const { data: follow } = await supabase
            .from("follows")
            .select("follower_id")
            .match({ follower_id: user.id, following_id: data.id })
            .single();
          setIsFollowing(!!follow);
        }
      }
      setLoading(false);
    }
    load();
  }, [username, user]);

  async function handleFollow() {
    if (!user || !profile) return;
    setIsFollowing(f => !f);
    await toggleFollow(user.id, profile.id, isFollowing);
  }

  if (loading) return <LoadingSpinner full />;
  if (!profile) return <View className="flex-1 bg-white items-center justify-center"><Text className="text-gray-400">Profil introuvable</Text></View>;

  const isSelf = user?.id === profile.id;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="items-center px-5 pt-8 pb-4">
        <Avatar uri={profile.avatar_url} name={profile.display_name ?? profile.username} size={80} />
        <Text className="text-lg font-semibold text-gray-900 mt-3">{profile.display_name ?? profile.username}</Text>
        <Text className="text-sm text-gray-500">@{profile.username}</Text>
        {profile.bio && <Text className="text-sm text-gray-500 text-center mt-2 leading-5">{profile.bio}</Text>}
        {profile.location && <Text className="text-[12px] text-accent mt-1">📍 {profile.location}</Text>}

        {!isSelf && user && (
          <TouchableOpacity
            onPress={handleFollow}
            className={`mt-4 px-8 py-2.5 rounded-full border ${isFollowing ? "border-gray-300 bg-white" : "border-accent bg-accent"}`}
          >
            <Text className={`text-sm font-semibold ${isFollowing ? "text-gray-600" : "text-white"}`}>
              {isFollowing ? "Abonné ✓" : "Suivre"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
    </ScrollView>
  );
}
