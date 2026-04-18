import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import { PostCard } from "../../components/feed/PostCard";
import { EmptyState } from "../../components/ui/EmptyState";

export default function FeedScreen() {
  const { user } = useAuth();
  const { posts, loading, refreshing, refresh, like } = useFeed(user?.id);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[22px] font-medium text-gray-900">Pikolèt</Text>
          <Text className="text-[13px] text-gray-400">Communauté Guyane</Text>
        </View>
        <TouchableOpacity className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
          <Text className="text-base">🔔</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1D9E75" />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="🐦"
              title="Aucun post pour l'instant"
              subtitle="Sois le premier à partager un chant de la communauté"
            />
          )
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            userId={user?.id}
            onLike={() => like(item.id)}
            onComment={() => {}}
          />
        )}
      />
    </View>
  );
}
