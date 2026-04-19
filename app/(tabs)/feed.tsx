import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFeed } from "../../hooks/useFeed";
import { useAuth } from "../../hooks/useAuth";
import { PostCard } from "../../components/feed/PostCard";
import { CommentsSheet } from "../../components/feed/CommentsSheet";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonPostCard } from "../../components/ui/SkeletonPostCard";

export default function FeedScreen() {
  const { user } = useAuth();
  const { posts, loading, refreshing, refresh, like, loadMore, loadingMore, hasMore } = useFeed(user?.id);
  const router = useRouter();
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const isMounted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    refresh();
  }, [refresh]));

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(p =>
      p.content?.toLowerCase().includes(q) ||
      p.author.username.toLowerCase().includes(q) ||
      (p.author.display_name ?? "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[22px] font-medium text-gray-900">Pikolèt</Text>
          <Text className="text-[13px] text-gray-400">Communauté Guyane</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => { setShowSearch(s => !s); setQuery(""); }}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name={showSearch ? "close" : "search"} size={16} color="#6B7280" />
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              onPress={() => router.push("/post/new")}
              className="w-8 h-8 rounded-full bg-accent items-center justify-center"
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSearch && (
        <View className="px-5 pb-2">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher…"
            autoFocus
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {loading ? (
        <View className="px-4 pt-2">
          {[1, 2, 3].map(i => <SkeletonPostCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1D9E75" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="🐦"
              title={query ? "Aucun résultat" : "Aucun post pour l'instant"}
              subtitle={query ? "Essaie un autre terme" : "Sois le premier à partager un chant de la communauté"}
            />
          }
          ListFooterComponent={
            loadingMore && hasMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#1D9E75" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              userId={user?.id}
              onLike={() => like(item.id)}
              onComment={() => setCommentPostId(item.id)}
            />
          )}
        />
      )}

      <CommentsSheet
        postId={commentPostId ?? ""}
        userId={user?.id}
        visible={!!commentPostId}
        onClose={() => setCommentPostId(null)}
      />
    </View>
  );
}
