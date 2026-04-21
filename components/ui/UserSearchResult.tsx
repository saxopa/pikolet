import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import type { SearchProfile } from "../../hooks/useUserSearch";

type Props = {
  profile: SearchProfile;
  onPress: () => void;
  onFollow: () => void;
  followLoading?: boolean;
};

export function UserSearchResult({ profile, onPress, onFollow, followLoading }: Props) {
  const isFollowing = profile.followStatus === "accepted";
  const isPending = profile.followStatus === "pending";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-50"
    >
      {/* Avatar */}
      <Avatar
        uri={profile.avatar_url}
        name={profile.display_name ?? profile.username}
        size={46}
      />

      {/* Infos */}
      <View className="flex-1 min-w-0">
        <Text
          className="text-[14px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {profile.display_name ?? profile.username}
        </Text>
        <Text className="text-[12px] text-gray-400 mt-0.5" numberOfLines={1}>
          @{profile.username}
        </Text>
        {profile.bio ? (
          <Text className="text-[11px] text-gray-400 mt-0.5" numberOfLines={1}>
            {profile.bio}
          </Text>
        ) : null}
      </View>

      {/* Bouton Suivre */}
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); onFollow(); }}
        disabled={followLoading || isPending || isFollowing}
        activeOpacity={0.8}
        className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
          isFollowing
            ? "border-green-200 bg-green-50"
            : isPending
            ? "border-gray-200 bg-gray-50"
            : "border-accent bg-accent"
        }`}
        style={{ minWidth: 80, justifyContent: "center" }}
      >
        {followLoading ? (
          <ActivityIndicator size="small" color={isFollowing || isPending ? "#9CA3AF" : "#fff"} />
        ) : (
          <>
            <Ionicons
              name={
                isFollowing
                  ? "checkmark-circle"
                  : isPending
                  ? "time-outline"
                  : "person-add-outline"
              }
              size={12}
              color={isFollowing ? "#22c55e" : isPending ? "#9CA3AF" : "#fff"}
            />
            <Text
              className={`text-[11px] font-semibold ${
                isFollowing
                  ? "text-green-600"
                  : isPending
                  ? "text-gray-400"
                  : "text-white"
              }`}
            >
              {isFollowing ? "Abonné" : isPending ? "En attente" : "Suivre"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
