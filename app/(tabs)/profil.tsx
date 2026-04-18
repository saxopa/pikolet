import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../../components/ui/Avatar";
import { signOut } from "../../lib/supabase";
import { useRouter } from "expo-router";

type StatProps = { value: string | number; label: string };

function Stat({ value, label }: StatProps) {
  return (
    <View className="flex-1 items-center py-3">
      <Text className="text-[17px] font-semibold text-gray-900">{value}</Text>
      <Text className="text-[11px] text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}

export default function ProfilScreen() {
  const { profile, user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-5xl mb-4">🐦</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2">Rejoins la communauté</Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Connecte-toi pour suivre tes oiseaux, partager tes chants et rejoindre les éleveurs de Guyane
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

  async function handleSignOut() {
    Alert.alert("Déconnexion", "Tu veux te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="items-center px-5 pt-8 pb-4">
        <Avatar uri={profile?.avatar_url} name={profile?.display_name ?? profile?.username} size={80} />
        <Text className="text-lg font-semibold text-gray-900 mt-3">
          {profile?.display_name ?? profile?.username ?? "Mon profil"}
        </Text>
        {profile?.bio && (
          <Text className="text-sm text-gray-500 text-center mt-1.5 leading-5">{profile.bio}</Text>
        )}
        {profile?.location && (
          <Text className="text-[12px] text-accent mt-1">📍 {profile.location}</Text>
        )}
      </View>

      {/* Stats */}
      <View className="flex-row border-t border-b border-gray-100 mx-0">
        <Stat value="—" label="oiseaux" />
        <View className="w-px bg-gray-100" />
        <Stat value="—" label="chants" />
        <View className="w-px bg-gray-100" />
        <Stat value="—" label="abonnés" />
        <View className="w-px bg-gray-100" />
        <Stat value="—" label="victoires" />
      </View>

      {/* Actions */}
      <View className="px-5 mt-6 gap-3">
        <TouchableOpacity
          onPress={() => router.push("/auth/edit-profile")}
          className="bg-accent-light rounded-xl py-3 items-center"
        >
          <Text className="text-accent-dark font-semibold text-sm">Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} className="py-3 items-center">
          <Text className="text-gray-400 text-sm">Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
