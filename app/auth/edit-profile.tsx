import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { upsertProfile } from "../../lib/supabase";

export default function EditProfileScreen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
    }
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    const { error } = await upsertProfile({
      id: user.id,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      location: location.trim() || null,
    });
    setLoading(false);
    if (error) Alert.alert("Erreur", error.message);
    else { Alert.alert("✓ Profil mis à jour"); router.back(); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {[
          { label: "Nom affiché", value: displayName, set: setDisplayName, placeholder: profile?.username ?? "Ton nom" },
          { label: "Ville", value: location, set: setLocation, placeholder: "Cayenne, Kourou…" },
        ].map(f => (
          <View key={f.label} className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-1.5">{f.label}</Text>
            <TextInput value={f.value} onChangeText={f.set} placeholder={f.placeholder} className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
          </View>
        ))}

        <View className="mb-6">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            placeholder="Éleveur depuis… Spécialité…"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholderTextColor="#9CA3AF"
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={loading} className={`rounded-xl py-3.5 items-center ${loading ? "bg-accent/60" : "bg-accent"}`}>
          <Text className="text-white font-semibold">{loading ? "Enregistrement…" : "Enregistrer"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
