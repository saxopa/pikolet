import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signUpWithEmail, upsertProfile } from "../../lib/supabase";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !username) {
      Alert.alert("Champs requis", "Email, mot de passe et pseudo sont obligatoires.");
      return;
    }
    if (password.length < 6) { Alert.alert("Mot de passe trop court", "6 caractères minimum."); return; }
    setLoading(true);
    const { data, error } = await signUpWithEmail(email.trim(), password);
    if (error) { Alert.alert("Erreur", error.message); setLoading(false); return; }
    if (data.user) {
      await upsertProfile({ id: data.user.id, username: username.trim(), location: location.trim() || null });
    }
    setLoading(false);
    Alert.alert("Bienvenue !", "Compte créé. Vérifie ton email pour confirmer.", [
      { text: "OK", onPress: () => router.replace("/(tabs)/feed") },
    ]);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 48 }} keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-semibold text-gray-900 mb-1">Créer un compte</Text>
        <Text className="text-sm text-gray-400 mb-8">Rejoins la communauté Pikolèt</Text>

        {[
          { label: "Pseudo *", value: username, set: setUsername, placeholder: "Djef_Az", type: "default" },
          { label: "Email *", value: email, set: setEmail, placeholder: "ton@email.com", type: "email-address" },
          { label: "Mot de passe *", value: password, set: setPassword, placeholder: "6 caractères min.", type: "default", secure: true },
          { label: "Ville (optionnel)", value: location, set: setLocation, placeholder: "Cayenne", type: "default" },
        ].map(field => (
          <View key={field.label} className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-1.5">{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={field.set}
              autoCapitalize="none"
              keyboardType={field.type as never}
              secureTextEntry={field.secure}
              placeholder={field.placeholder}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mt-2 mb-4 ${loading ? "bg-accent/60" : "bg-accent"}`}
        >
          <Text className="text-white font-semibold">{loading ? "Création…" : "Créer mon compte"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/auth/login")} className="items-center">
          <Text className="text-sm text-gray-400">
            Déjà un compte ? <Text className="text-accent font-medium">Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
