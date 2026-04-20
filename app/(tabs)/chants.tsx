import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChants } from "../../hooks/useChants";
import { useAuth } from "../../hooks/useAuth";
import { SongCard } from "../../components/feed/SongCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonPostCard } from "../../components/ui/SkeletonPostCard";

const TABS = [
  { key: "all", label: "Tous" },
  { key: "pikolet", label: "🐤 Pikolèt" },
  { key: "lorti", label: "🦜 Lorti" },
] as const;

export default function ChantsScreen() {
  const { songs, filter, setFilter, loading, refresh } = useChants();
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isMounted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    refresh();
  }, [refresh]));

  const filtered = useMemo(() => {
    if (!query.trim()) return songs;
    const q = query.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.bird as any)?.name?.toLowerCase().includes(q) ||
      (s.owner as any)?.username?.toLowerCase().includes(q)
    );
  }, [songs, query]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[24px] font-bold text-gray-900 font-display">Bibliothèque</Text>
          <Text className="text-[13px] text-gray-400">Chants partagés</Text>
        </View>
        {user && (
          <TouchableOpacity
            onPress={() => router.push("/chant/new")}
            className="w-8 h-8 rounded-full bg-accent items-center justify-center"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View className="px-5 pb-2">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un chant…"
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
          placeholderTextColor="#A08878"
        />
      </View>

      <View className="flex-row bg-white border-b border-gray-100">
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key as never)}
            className={`flex-1 py-2.5 items-center border-b-2 ${filter === tab.key ? "border-accent" : "border-transparent"}`}
          >
            <Text className={`text-[13px] ${filter === tab.key ? "text-accent font-semibold" : "text-gray-500"}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="px-4 pt-2">
          {[1, 2, 3].map(i => <SkeletonPostCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={s => s.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#B85C38" />}
          ListEmptyComponent={
            <EmptyState
              icon="🎵"
              title={query ? "Aucun résultat" : "Aucun chant"}
              subtitle={query ? "Essaie un autre terme" : "Sois le premier à partager un enregistrement"}
            />
          }
          renderItem={({ item }) => <SongCard song={item} />}
        />
      )}
    </View>
  );
}
