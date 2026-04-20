import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFeed } from "../../hooks/useFeed";
import { deletePost } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { PostCard } from "../../components/feed/PostCard";
import { CommentsSheet } from "../../components/feed/CommentsSheet";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonPostCard } from "../../components/ui/SkeletonPostCard";

export default function FeedScreen() {
  const { user } = useAuth();
  const { posts, loading, refreshing, refresh, like, loadMore, loadingMore, hasMore, error } = useFeed(user?.id);
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
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[24px] font-bold text-gray-900 font-display">Pikolèt</Text>
          <Text className="text-[13px] text-gray-400">Communauté</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => { setShowSearch(s => !s); setQuery(""); }}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name={showSearch ? "close" : "search"} size={16} color="#7A6456" />
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
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
            placeholderTextColor="#A08878"
          />
        </View>
      )}

      {error && (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-3xl">📡</Text>
          <Text className="text-sm text-gray-500">Impossible de charger le feed</Text>
          <TouchableOpacity onPress={refresh} className="px-5 py-2 bg-accent rounded-xl">
            <Text className="text-white text-sm font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && loading ? (
        <View className="px-4 pt-2">
          {[1, 2, 3].map(i => <SkeletonPostCard key={i} />)}
        </View>
      ) : !error && (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#B85C38" />}
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
                <ActivityIndicator color="#B85C38" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              userId={user?.id}
              onLike={() => like(item.id)}
              onComment={() => setCommentPostId(item.id)}
              onDelete={async (id) => { await deletePost(id); refresh(); }}
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
