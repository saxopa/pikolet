import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useVoliere } from "../../hooks/useVoliere";
import { BirdCard } from "../../components/bird/BirdCard";
import { EmptyState } from "../../components/ui/EmptyState";

export default function VoliereScreen() {
  const { user } = useAuth();
  const { birds, loading, refresh } = useVoliere(user?.id);
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-2 flex-row items-end justify-between">
        <View>
          <Text className="text-[22px] font-medium text-gray-900">Ma Volière</Text>
          <Text className="text-[13px] text-gray-400">
            {birds.length} oiseau{birds.length !== 1 ? "x" : ""}
          </Text>
        </View>
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-accent items-center justify-center"
          onPress={() => router.push("/bird/new")}
        >
          <Text className="text-white text-xl font-light">+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={birds}
        keyExtractor={b => b.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: 10 }}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#1D9E75" />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="🪺"
              title="Volière vide"
              subtitle="Ajoute ton premier oiseau pour commencer à suivre ses performances"
            />
          )
        }
        renderItem={({ item }) => (
          <View className="flex-1">
            <BirdCard bird={item} onPress={() => router.push(`/bird/${item.id}`)} />
          </View>
        )}
      />
    </View>
  );
}
