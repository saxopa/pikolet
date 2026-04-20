import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { signInWithEmail } from "../../lib/supabase";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "Email not confirmed": "Confirme ton email avant de te connecter.",
  "Too many requests": "Trop de tentatives. Attends quelques minutes.",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ confirm_error?: string }>();

  // Message renvoyé par auth/confirm si le lien était expiré
  const confirmError = params.confirm_error;

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Champs requis", "Remplis l'email et le mot de passe.");
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      const msg = ERROR_MAP[error.message] ?? error.message;
      Alert.alert("Connexion impossible", msg);
      return;
    }
    router.replace("/(tabs)/feed");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-accent-light"
    >
      {/* Warm header */}
      <View className="items-center px-8 pt-16 pb-10">
        <Text style={{ fontSize: 52, marginBottom: 10 }}>🐤</Text>
        <Text className="text-[30px] font-bold text-accent-dark font-display">Pikolèt</Text>
        <Text className="text-sm text-accent mt-2 font-medium">Communauté éleveurs</Text>
      </View>

      {/* Bandeau d'erreur si le lien de confirmation était expiré */}
      {confirmError ? (
        <View className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <Text className="text-sm text-red-700 text-center">{confirmError}</Text>
        </View>
      ) : null}

      {/* White form card */}
      <View
        className="flex-1 bg-white px-6 pt-8"
        style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      >
        <Text className="text-xl font-bold text-gray-900 mb-6 font-display">Connexion</Text>

        <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ton@email.com"
          returnKeyType="next"
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-4"
          placeholderTextColor="#A08878"
        />

        <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mot de passe</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-6"
          placeholderTextColor="#A08878"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mb-4 ${loading ? "bg-accent/60" : "bg-accent"}`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">
            {loading ? "Connexion…" : "Se connecter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/auth/register")}
          className="items-center py-2"
        >
          <Text className="text-sm text-gray-400">
            Pas encore de compte ?{" "}
            <Text className="text-accent font-bold">Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
