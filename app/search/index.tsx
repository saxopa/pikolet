import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useUserSearch } from "../../hooks/useUserSearch";
import { sendFollowRequest, unfollowUser } from "../../lib/supabase";
import { UserSearchResult } from "../../components/ui/UserSearchResult";
import { Skeleton } from "../../components/ui/Skeleton";
import type { SearchProfile } from "../../hooks/useUserSearch";

export default function SearchScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [followLoadingIds, setFollowLoadingIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<TextInput>(null);

  const { results, loading, error, updateFollowStatus } = useUserSearch(query, user?.id);

  async function handleFollow(profile: SearchProfile) {
    if (!user) return;
    setFollowLoadingIds((prev) => new Set(prev).add(profile.id));
    try {
      if (profile.followStatus === "none") {
        await sendFollowRequest(user.id, profile.id);
        updateFollowStatus(profile.id, "pending");
      } else {
        // Permet de se désabonner si déjà abonné
        await unfollowUser(user.id, profile.id);
        updateFollowStatus(profile.id, "none");
      }
    } finally {
      setFollowLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });
    }
  }

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  // Écran non connecté
  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-5xl mb-4">🔍</Text>
        <Text className="text-lg font-bold text-gray-900 mb-2 font-display">
          Rechercher des éleveurs
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Connecte-toi pour découvrir et suivre d'autres passionnés
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          className="bg-accent rounded-xl px-8 py-3.5 w-full items-center"
        >
          <Text className="text-white font-semibold">Connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Contenu de la liste selon l'état
  const renderContent = () => {
    const trimmed = query.trim();

    // Requête trop courte → état vide illustré
    if (!trimmed || trimmed.length < 2) {
      return (
        <View className="items-center pt-20 px-8">
          <Text className="text-5xl mb-4">🐦</Text>
          <Text className="text-base font-semibold text-gray-700 font-display mb-1">
            Trouve des éleveurs
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Recherche par nom ou @pseudo (2 caractères min.)
          </Text>
        </View>
      );
    }

    // Chargement
    if (loading) {
      return (
        <View className="px-4 pt-3 gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center gap-3 py-2">
              <Skeleton width={46} height={46} borderRadius={23} />
              <View className="flex-1 gap-2">
                <Skeleton width={130} height={13} />
                <Skeleton width={90} height={11} />
              </View>
              <Skeleton width={74} height={30} borderRadius={15} />
            </View>
          ))}
        </View>
      );
    }

    // Erreur
    if (error) {
      return (
        <View className="items-center pt-16 px-8">
          <Text className="text-3xl mb-3">📡</Text>
          <Text className="text-sm text-gray-400 text-center">{error}</Text>
        </View>
      );
    }

    // Aucun résultat
    if (results.length === 0) {
      return (
        <View className="items-center pt-16 px-8">
          <Text className="text-3xl mb-3">🫥</Text>
          <Text className="text-base font-semibold text-gray-700 font-display mb-1">
            Aucun résultat
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Aucun profil public ne correspond à "{trimmed}"
          </Text>
        </View>
      );
    }

    return null; // FlatList gère l'affichage
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-gray-100"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>

        {/* Searchbar */}
        <View className="flex-1 flex-row items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un utilisateur…"
            placeholderTextColor="#9CA3AF"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 text-[14px] text-gray-900"
            style={{ paddingVertical: 0 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Corps */}
      {renderContent() ?? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <UserSearchResult
              profile={item}
              followLoading={followLoadingIds.has(item.id)}
              onPress={() => router.push(`/profile/${item.username}`)}
              onFollow={() => handleFollow(item)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-gray-50" />}
          ListFooterComponent={
            results.length > 0 ? (
              <Text className="text-center text-[11px] text-gray-300 py-4">
                {results.length} profil{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
              </Text>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </KeyboardAvoidingView>
  );
}
