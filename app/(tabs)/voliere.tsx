import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useVoliere } from "../../hooks/useVoliere";
import { BirdCard } from "../../components/bird/BirdCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonBirdCard } from "../../components/ui/SkeletonBirdCard";

export default function VoliereScreen() {
  const { user, isAuthenticated } = useAuth();
  const { birds, loading, refresh } = useVoliere(user?.id);

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-5xl mb-4">🪺</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2 font-display">Ta volière t'attend</Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Connecte-toi pour gérer tes oiseaux, suivre leurs performances et enregistrer leurs chants
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isMounted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    refresh();
  }, [refresh]));

  const filtered = useMemo(() => {
    if (!query.trim()) return birds;
    const q = query.toLowerCase();
    return birds.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.species.toLowerCase().includes(q) ||
      (b.ring_code ?? "").toLowerCase().includes(q)
    );
  }, [birds, query]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[24px] font-bold text-gray-900 font-display">Ma Volière</Text>
          <Text className="text-[13px] text-gray-400">
            {loading ? "…" : `${birds.length} oiseau${birds.length !== 1 ? "x" : ""}`}
          </Text>
        </View>
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-accent items-center justify-center"
          onPress={() => router.push("/bird/new")}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {!loading && birds.length > 0 && (
        <View className="px-5 pb-2">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un oiseau…"
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900"
            placeholderTextColor="#A08878"
          />
        </View>
      )}

      {loading ? (
        <View className="px-4 pt-2 flex-row flex-wrap gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ width: "47.5%" }}>
              <SkeletonBirdCard />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 10 }}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor="#B85C38" />}
          ListEmptyComponent={
            <EmptyState
              icon="🪺"
              title={query ? "Aucun résultat" : "Volière vide"}
              subtitle={query ? "Essaie un autre terme" : "Ajoute ton premier oiseau pour commencer à suivre ses performances"}
            />
          }
          renderItem={({ item }) => (
            <View className="flex-1">
              <BirdCard bird={item} onPress={() => router.push(`/bird/${item.id}`)} />
            </View>
          )}
        />
      )}
    </View>
  );
}
