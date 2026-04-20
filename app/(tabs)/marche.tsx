import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useListings } from "../../hooks/useListings";
import { useAuth } from "../../hooks/useAuth";
import { ListingCard } from "../../components/market/ListingCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonPostCard } from "../../components/ui/SkeletonPostCard";
import type { Listing } from "../../types";

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "oiseau", label: "🐦 Oiseaux" },
  { key: "materiel", label: "🪚 Matériel" },
  { key: "nourriture", label: "🌾 Nourriture" },
  { key: "autre", label: "📦 Autre" },
] as const;

type ListingWithSeller = Listing & {
  seller: { id: string; username: string; display_name: string | null; location: string | null };
};

export default function MarcheScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings, category, changeCategory, loading, error, refresh } = useListings();
  const [query, setQuery] = useState("");
  const isMounted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    refresh();
  }, [refresh]));

  const filtered = useMemo(() => {
    if (!query.trim()) return listings;
    const q = query.toLowerCase();
    return listings.filter(l =>
      l.title.toLowerCase().includes(q) ||
      (l.description ?? "").toLowerCase().includes(q) ||
      (l.location ?? "").toLowerCase().includes(q)
    );
  }, [listings, query]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[24px] font-bold text-gray-900 font-display">Marché</Text>
          <Text className="text-[13px] text-gray-400">Annonces de la communauté</Text>
        </View>
        {user && (
          <TouchableOpacity
            onPress={() => router.push("/annonce/new")}
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
          placeholder="Rechercher une annonce…"
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
          placeholderTextColor="#A08878"
        />
      </View>

      <View className="bg-white border-b border-gray-100">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={c => c.key}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => changeCategory(item.key)}
              className={`px-3.5 py-2.5 mr-1 border-b-2 ${category === item.key ? "border-accent" : "border-transparent"}`}
            >
              <Text className={`text-[13px] ${category === item.key ? "text-accent font-semibold" : "text-gray-500"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error && (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-3xl">📡</Text>
          <Text className="text-sm text-gray-500">Impossible de charger les annonces</Text>
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
          data={filtered as ListingWithSeller[]}
          keyExtractor={l => l.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor="#B85C38" />}
          ListEmptyComponent={
            <EmptyState
              icon="🛒"
              title={query ? "Aucun résultat" : "Aucune annonce"}
              subtitle={query ? "Essaie un autre terme" : "Sois le premier à publier une annonce"}
            />
          }
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => router.push(`/annonce/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}
