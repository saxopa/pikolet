import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useChants } from "../../hooks/useChants";
import { useAuth } from "../../hooks/useAuth";
import { SongCard } from "../../components/feed/SongCard";
import { EmptyState } from "../../components/ui/EmptyState";

const TABS = [
  { key: "all", label: "Tous" },
  { key: "pikolet", label: "Pikolèt" },
  { key: "lorti", label: "Lorti" },
] as const;

export default function ChantsScreen() {
  const { songs, filter, setFilter, loading, refresh } = useChants();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[22px] font-medium text-gray-900">Bibliothèque</Text>
          <Text className="text-[13px] text-gray-400">Chants partagés</Text>
        </View>
        {user && (
          <TouchableOpacity
            onPress={() => router.push("/chant/new")}
            className="w-8 h-8 rounded-full bg-accent items-center justify-center"
          >
            <Text className="text-white text-xl font-light">+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View className="flex-row border-b border-gray-100 mx-0">
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setFilter(tab.key as never)}
            className={`flex-1 py-2 items-center border-b-2 ${filter === tab.key ? "border-accent" : "border-transparent"}`}
          >
            <Text className={`text-[13px] ${filter === tab.key ? "text-accent font-medium" : "text-gray-500"}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={songs}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#1D9E75" />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon="🎵" title="Aucun chant" subtitle="Sois le premier à partager un enregistrement" />
          )
        }
        renderItem={({ item }) => <SongCard song={item} />}
      />
    </View>
  );
}
