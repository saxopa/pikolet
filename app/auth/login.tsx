import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
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
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-semibold text-gray-900 mb-1">Connexion</Text>
        <Text className="text-sm text-gray-400 mb-8">Communauté éleveurs Guyane 🐦</Text>

        <Text className="text-xs font-medium text-gray-600 mb-1.5">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ton@email.com"
          returnKeyType="next"
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-4"
          placeholderTextColor="#9CA3AF"
        />

        <Text className="text-xs font-medium text-gray-600 mb-1.5">Mot de passe</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 mb-6"
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mb-4 ${loading ? "bg-accent/60" : "bg-accent"}`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Connexion…" : "Se connecter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/auth/register")}
          className="items-center py-2"
        >
          <Text className="text-sm text-gray-400">
            Pas encore de compte ?{" "}
            <Text className="text-accent font-semibold">Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
