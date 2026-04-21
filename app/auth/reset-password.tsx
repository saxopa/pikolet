import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleReset() {
    if (!password) { setError("Le mot de passe est obligatoire."); return; }
    if (password.length < 6) { setError("6 caractères minimum."); return; }

    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      toast(`Erreur : ${err.message}`, "error");
      return;
    }

    toast("Mot de passe mis à jour ✓", "success");
    router.replace("/(tabs)/feed");
  }

  return (
    <View className="flex-1 bg-accent-light items-center justify-center px-8">
      <Text style={{ fontSize: 52, marginBottom: 12 }}>🔒</Text>
      <Text className="text-[22px] font-bold text-accent-dark font-display mb-2 text-center">
        Nouveau mot de passe
      </Text>
      <Text className="text-sm text-accent/80 text-center mb-8 leading-6">
        Choisis un mot de passe sécurisé d'au moins 6 caractères.
      </Text>

      <View className="w-full bg-white rounded-2xl px-5 py-6 gap-4">
        <View>
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Nouveau mot de passe <Text className="text-red-400">*</Text>
          </Text>
          <View style={{ position: "relative" }}>
            <TextInput
              value={password}
              onChangeText={(v) => { setPassword(v); setError(null); }}
              secureTextEntry={!showPassword}
              placeholder="6 caractères min."
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleReset}
              className={`border rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              style={{ paddingRight: 48 }}
              placeholderTextColor="#A08878"
              accessibilityLabel="Nouveau mot de passe"
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(s => !s)}
              style={{ position: "absolute", right: 12, top: 12 }}
              accessibilityLabel={showPassword ? "Masquer" : "Afficher"}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#A08878"
              />
            </TouchableOpacity>
          </View>
          {error ? (
            <View className="flex-row items-center gap-1 mt-1.5">
              <Ionicons name="alert-circle" size={13} color="#b91c1c" />
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="rounded-xl py-3.5 items-center bg-accent"
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
