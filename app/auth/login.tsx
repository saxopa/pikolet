import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmail, signInWithGoogle } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "Email not confirmed": "Confirme ton email avant de te connecter.",
  "Too many requests": "Trop de tentatives. Attends quelques minutes.",
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const params = useLocalSearchParams<{ confirm_error?: string }>();
  const confirmError = params.confirm_error;

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) toast("Connexion Google impossible.", "error");
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      toast("Remplis l'email et le mot de passe.", "error");
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      const msg = ERROR_MAP[error.message] ?? "Connexion impossible. Vérifie tes identifiants.";
      toast(msg, "error");
      return;
    }
    router.replace("/(tabs)/feed");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-accent-light"
    >
      {/* Overlay de chargement */}
      <Modal visible={loading} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              gap: 16,
              minWidth: 180,
            }}
          >
            <ActivityIndicator size="large" color="#B85C38" />
            <Text style={{ color: "#7A4E2D", fontWeight: "600", fontSize: 15 }}>
              Connexion…
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center px-8 pt-16 pb-10">
          <Text style={{ fontSize: 52, marginBottom: 10 }}>🐤</Text>
          <Text className="text-[30px] font-bold text-accent-dark font-display">Pikolèt</Text>
          <Text className="text-sm text-accent mt-2 font-medium">Communauté éleveurs</Text>
        </View>

        {/* Bandeau erreur lien expiré */}
        {confirmError ? (
          <View
            className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center gap-2"
            accessibilityRole="alert"
          >
            <Ionicons name="warning-outline" size={16} color="#b91c1c" />
            <Text className="text-sm text-red-700 flex-1">{confirmError}</Text>
          </View>
        ) : null}

        {/* Formulaire */}
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
            accessibilityLabel="Adresse email"
            textContentType="emailAddress"
            autoComplete="email"
          />

          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Mot de passe</Text>
          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              style={{ paddingRight: 48 }}
              placeholderTextColor="#A08878"
              accessibilityLabel="Mot de passe"
              textContentType="password"
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(s => !s)}
              style={{ position: "absolute", right: 12, top: 12 }}
              accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#A08878"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="rounded-xl py-3.5 items-center mb-4 bg-accent"
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">Se connecter</Text>
          </TouchableOpacity>

          {/* Séparateur */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs text-gray-400">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google */}
          <TouchableOpacity
            onPress={handleGoogle}
            className="flex-row items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 mb-4 bg-white"
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continuer avec Google"
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text className="text-sm font-semibold text-gray-700">Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/auth/register")}
            className="items-center py-2"
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-400">
              Pas encore de compte ?{" "}
              <Text className="text-accent font-bold">Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
