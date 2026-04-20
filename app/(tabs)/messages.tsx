import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useCallback, useRef } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useConversations } from "../../hooks/useConversations";
import { ConversationItem } from "../../components/messages/ConversationItem";
import { Skeleton } from "../../components/ui/Skeleton";

export default function MessagesScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { conversations, loading, error, refresh, getOtherParticipant } = useConversations(user?.id);
  const isMounted = useRef(false);

  useFocusEffect(useCallback(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    refresh();
  }, [refresh]));

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-5xl mb-4">💬</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2 font-display">Messagerie</Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Connecte-toi pour échanger avec la communauté
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

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-gray-50">
        <Text className="text-3xl">📡</Text>
        <Text className="text-sm text-gray-500">Impossible de charger les messages</Text>
        <TouchableOpacity onPress={refresh} className="px-5 py-2 bg-accent rounded-xl">
          <Text className="text-white text-sm font-semibold">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-[24px] font-bold text-gray-900 font-display">Messages</Text>
        <Text className="text-[13px] text-gray-400">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</Text>
      </View>

      {loading ? (
        <View className="gap-px">
          {[1, 2, 3, 4].map(i => (
            <View key={i} className="flex-row items-center gap-3 px-5 py-3.5 bg-white">
              <Skeleton width={48} height={48} borderRadius={24} />
              <View className="flex-1 gap-2">
                <Skeleton width={120} height={13} />
                <Skeleton width={200} height={11} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={c => c.id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor="#B85C38" />}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20 gap-3">
              <Text className="text-5xl">💬</Text>
              <Text className="text-base font-semibold text-gray-700 font-display">Aucune conversation</Text>
              <Text className="text-sm text-gray-400 text-center px-8">
                Contacte un vendeur depuis le Marché ou un profil pour démarrer
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const other = getOtherParticipant(item);
            return (
              <ConversationItem
                conversation={item}
                other={other}
                userId={user!.id}
                onPress={() => router.push(`/conversation/${item.id}?username=${other.username}&display=${other.display_name ?? other.username}`)}
              />
            );
          }}
        />
      )}
    </View>
  );
}
