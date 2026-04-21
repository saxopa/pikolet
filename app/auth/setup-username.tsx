import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase, upsertProfile } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

export default function SetupUsernameScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  async function handleSubmit() {
    const trimmed = username.trim();
    if (!trimmed) { setError("Le pseudo est obligatoire."); return; }
    if (trimmed.length < 3) { setError("3 caractères minimum."); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError("Lettres, chiffres et _ uniquement."); return; }
    if (!userId) return;

    setError(null);
    setLoading(true);
    const { error: err } = await upsertProfile({ id: userId, username: trimmed });
    setLoading(false);

    if (err) {
      if (err.message.includes("duplicate") || err.message.includes("unique")) {
        setError("Ce pseudo est déjà pris.");
      } else {
        toast(`Erreur : ${err.message}`, "error");
      }
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)/feed");
  }

  return (
    <View className="flex-1 bg-accent-light items-center justify-center px-8">
      <Text style={{ fontSize: 52, marginBottom: 12 }}>🐤</Text>
      <Text className="text-[22px] font-bold text-accent-dark font-display mb-2 text-center">
        Choisis ton pseudo
      </Text>
      <Text className="text-sm text-accent/80 text-center mb-8 leading-6">
        Ton pseudo est unique et visible par tous les membres de la communauté.
      </Text>

      <View className="w-full bg-white rounded-2xl px-5 py-6 gap-4">
        <View>
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Pseudo <Text className="text-red-400">*</Text>
          </Text>
          <TextInput
            value={username}
            onChangeText={(v) => { setUsername(v); setError(null); }}
            autoCapitalize="none"
            placeholder="Djef_Az"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            className={`border rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
            placeholderTextColor="#A08878"
            accessibilityLabel="Pseudo"
            textContentType="username"
          />
          {error ? (
            <View className="flex-row items-center gap-1 mt-1.5">
              <Ionicons name="alert-circle" size={13} color="#b91c1c" />
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !userId}
          className="rounded-xl py-3.5 items-center bg-accent"
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Continuer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
