import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signUpWithEmail } from "../../lib/supabase";

type Field = { label: string; value: string; set: (v: string) => void; placeholder: string; secure?: boolean; keyboard?: "default" | "email-address" };

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fields: Field[] = [
    { label: "Pseudo *", value: username, set: setUsername, placeholder: "Djef_Az" },
    { label: "Email *", value: email, set: setEmail, placeholder: "ton@email.com", keyboard: "email-address" },
    { label: "Mot de passe *", value: password, set: setPassword, placeholder: "6 caractères min.", secure: true },
    { label: "Ville (optionnel)", value: location, set: setLocation, placeholder: "Cayenne" },
  ];

  async function handleRegister() {
    if (!email.trim() || !password || !username.trim()) {
      Alert.alert("Champs requis", "Email, mot de passe et pseudo sont obligatoires.");
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert("Pseudo trop court", "3 caractères minimum.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Mot de passe trop court", "6 caractères minimum.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      Alert.alert("Pseudo invalide", "Lettres, chiffres et _ uniquement.");
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email.trim().toLowerCase(), password, {
      username: username.trim(),
      location: location.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      const msg = error.message.includes("already registered")
        ? "Cet email est déjà utilisé."
        : error.message;
      Alert.alert("Erreur inscription", msg);
      return;
    }

    Alert.alert(
      "Bienvenue ! 🐦",
      "Compte créé. Vérifie ton email pour confirmer, puis connecte-toi.",
      [{ text: "Se connecter", onPress: () => router.replace("/auth/login") }]
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-semibold text-gray-900 mb-1">Créer un compte</Text>
        <Text className="text-sm text-gray-400 mb-8">Rejoins la communauté Pikolèt 🐦</Text>

        {fields.map((f) => (
          <View key={f.label} className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-1.5">{f.label}</Text>
            <TextInput
              value={f.value}
              onChangeText={f.set}
              autoCapitalize="none"
              keyboardType={f.keyboard ?? "default"}
              secureTextEntry={f.secure}
              placeholder={f.placeholder}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mt-2 mb-4 ${loading ? "bg-accent/60" : "bg-accent"}`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Création du compte…" : "Créer mon compte"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          className="items-center py-2"
        >
          <Text className="text-sm text-gray-400">
            Déjà un compte ?{" "}
            <Text className="text-accent font-semibold">Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
