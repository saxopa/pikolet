import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: "https://saxopa.github.io/pikolet/auth/confirm",
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <View className="flex-1 bg-accent-light items-center justify-center px-8">
        <Text style={{ fontSize: 52, marginBottom: 12 }}>📬</Text>
        <Text className="text-[22px] font-bold text-accent-dark font-display mb-2 text-center">
          Email envoyé !
        </Text>
        <Text className="text-sm text-accent/80 text-center mb-8 leading-6">
          Si un compte existe pour{" "}
          <Text className="font-semibold">{email.trim()}</Text>, tu recevras un lien pour réinitialiser ton mot de passe.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          className="bg-accent rounded-xl px-8 py-3.5 w-full items-center"
          accessibilityRole="button"
        >
          <Text className="text-white font-bold">Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-light items-center justify-center px-8">
      <Text style={{ fontSize: 52, marginBottom: 12 }}>🔑</Text>
      <Text className="text-[22px] font-bold text-accent-dark font-display mb-2 text-center">
        Mot de passe oublié ?
      </Text>
      <Text className="text-sm text-accent/80 text-center mb-8 leading-6">
        Saisis ton email et on t'envoie un lien pour en choisir un nouveau.
      </Text>

      <View className="w-full bg-white rounded-2xl px-5 py-6 gap-4">
        <View>
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="ton@email.com"
            autoFocus
            returnKeyType="send"
            onSubmitEditing={handleSend}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
            placeholderTextColor="#A08878"
            accessibilityLabel="Adresse email"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !email.trim()}
          className="rounded-xl py-3.5 items-center bg-accent"
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Envoyer le lien</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/auth/login")}
        className="items-center py-4 mt-2"
        accessibilityRole="button"
      >
        <Text className="text-sm text-gray-400">
          <Text className="text-accent font-bold">← Retour à la connexion</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
