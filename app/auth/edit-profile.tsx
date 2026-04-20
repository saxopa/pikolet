import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { upsertProfile, uploadAvatar } from "../../lib/supabase";

export default function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
    }
  }, [profile]);

  async function pickAvatar() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);

    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarUri) {
      const asset = avatarUri;
      const fileName = asset.split("/").pop() ?? "avatar.jpg";
      const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
      const { url, error } = await uploadAvatar(user.id, asset, fileName, mimeType);
      if (error) {
        toast("Erreur upload avatar : " + (error as any)?.message, "error");
        setLoading(false);
        return;
      }
      avatarUrl = url;
    }

    const { error } = await upsertProfile({
      id: user.id,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      location: location.trim() || null,
      ...(avatarUrl !== profile?.avatar_url ? { avatar_url: avatarUrl } : {}),
    });

    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      await refreshProfile();
      toast("Profil mis à jour ✓");
      router.back();
    }
  }

  const avatarSource = avatarUri ?? profile?.avatar_url;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Avatar picker */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
            {avatarSource ? (
              <Image
                source={{ uri: avatarSource }}
                style={{ width: 88, height: 88, borderRadius: 44 }}
              />
            ) : (
              <View style={{ width: 88, height: 88, borderRadius: 44 }} className="bg-gray-100 items-center justify-center">
                <Ionicons name="person" size={36} color="#A08878" />
              </View>
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={13} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-gray-400 mt-2">Appuyer pour changer la photo</Text>
        </View>

        {[
          { label: "Nom affiché", value: displayName, set: setDisplayName, placeholder: profile?.username ?? "Ton nom" },
          { label: "Ville", value: location, set: setLocation, placeholder: "Cayenne, Kourou…" },
        ].map(f => (
          <View key={f.label} className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-1.5">{f.label}</Text>
            <TextInput
              value={f.value}
              onChangeText={f.set}
              placeholder={f.placeholder}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
              placeholderTextColor="#A08878"
            />
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
            placeholderTextColor="#A08878"
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center ${loading ? "bg-accent/60" : "bg-accent"}`}
        >
          <Text className="text-white font-semibold">
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
