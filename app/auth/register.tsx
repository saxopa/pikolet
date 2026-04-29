import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "../../context/ToastContext";
import { signInWithGoogle, signUpWithEmail } from "../../lib/supabase";

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
};

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function clearError(field: keyof FieldErrors) {
    setErrors(e => { const next = { ...e }; delete next[field]; return next; });
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) toast("Connexion Google impossible.", "error");
  }

  async function handleRegister() {
    const newErrors: FieldErrors = {};
    if (!username.trim()) newErrors.username = "Le pseudo est obligatoire.";
    else if (username.trim().length < 3) newErrors.username = "3 caractères minimum.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) newErrors.username = "Lettres, chiffres et _ uniquement.";

    if (!email.trim()) newErrors.email = "L'email est obligatoire.";

    if (!password) newErrors.password = "Le mot de passe est obligatoire.";
    else if (password.length < 6) newErrors.password = "6 caractères minimum.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await signUpWithEmail(email.trim().toLowerCase(), password, {
      username: username.trim(),
      location: location.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("User already registered")
      ) {
        setErrors({ email: "Cet email est déjà utilisé." });
        toast("Cet email est déjà utilisé.", "error");
      } else if (
        error.message.toLowerCase().includes("rate limit") ||
        error.message.includes("only request this after") ||
        (error as any).status === 429
      ) {
        toast("Trop de tentatives. Attends quelques minutes.", "error");
      } else if (
        error.message.includes("invalid email") ||
        error.message.includes("Invalid email")
      ) {
        setErrors({ email: "Adresse email invalide." });
        toast("Adresse email invalide.", "error");
      } else if (error.message.includes("Password should be")) {
        setErrors({ password: "Mot de passe trop faible." });
        toast("Mot de passe trop faible.", "error");
      } else if (
        error.message.includes("duplicate") ||
        error.message.includes("unique")
      ) {
        setErrors({ username: "Ce pseudo est déjà pris." });
        toast("Ce pseudo est déjà pris.", "error");
      } else {
        toast(`Erreur : ${error.message}`, "error");
      }
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-light px-8">
        <Text style={{ fontSize: 64, marginBottom: 16 }}>📬</Text>
        <Text className="text-[22px] font-bold text-accent-dark font-display text-center mb-3">
          Vérifie tes emails !
        </Text>
        <Text className="text-sm text-accent text-center mb-2 leading-6">
          Un email de confirmation t'a été envoyé.
        </Text>
        <Text className="text-sm text-accent/80 text-center mb-8 leading-6">
          Clique sur le lien dans l'email → tu seras connecté automatiquement.
        </Text>
        <View className="w-full bg-white rounded-2xl px-5 py-4 mb-8 gap-3">
          {([
            { n: "1", t: "Ouvre l'application Mail" },
            { n: "2", t: "Clique sur le lien de confirmation" },
            { n: "3", t: "Tu es connecté automatiquement !" },
          ] as const).map(({ n, t }) => (
            <View key={n} className="flex-row items-center gap-3">
              <View className="w-7 h-7 rounded-full bg-accent items-center justify-center">
                <Text className="text-white text-xs font-bold">{n}</Text>
              </View>
              <Text className="text-sm text-gray-700 flex-1">{t}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.replace("/auth/login")}
          className="bg-accent rounded-xl px-8 py-3.5 w-full items-center"
          accessibilityRole="button"
        >
          <Text className="text-white font-bold">Aller à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
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
              Création du compte…
            </Text>
          </View>
        </View>
      </Modal>

      <View className="items-center px-8 pt-12 pb-6">
        <Text style={{ fontSize: 40, marginBottom: 8 }}>🐦</Text>
        <Text className="text-[22px] font-bold text-accent-dark font-display">Pikolèt</Text>
        <Text className="text-sm text-accent mt-1">Rejoins la communauté</Text>
      </View>

      <View
        className="flex-1 bg-white"
        style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xl font-bold text-gray-900 mb-5 font-display">Créer un compte</Text>

          {/* Pseudo */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Pseudo <Text className="text-red-400">*</Text>
            </Text>
            <TextInput
              value={username}
              onChangeText={(v) => { setUsername(v); clearError("username"); }}
              autoCapitalize="none"
              placeholder="Djef_Az"
              returnKeyType="next"
              className={`border rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 ${errors.username ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              placeholderTextColor="#A08878"
              accessibilityLabel="Pseudo"
              textContentType="username"
            />
            {errors.username ? (
              <View className="flex-row items-center gap-1 mt-1.5">
                <Ionicons name="alert-circle" size={13} color="#b91c1c" />
                <Text className="text-xs text-red-600">{errors.username}</Text>
              </View>
            ) : null}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Email <Text className="text-red-400">*</Text>
            </Text>
            <TextInput
              value={email}
              onChangeText={(v) => { setEmail(v); clearError("email"); }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="ton@email.com"
              returnKeyType="next"
              className={`border rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              placeholderTextColor="#A08878"
              accessibilityLabel="Adresse email"
              textContentType="emailAddress"
              autoComplete="email"
            />
            {errors.email ? (
              <View className="flex-row items-center gap-1 mt-1.5">
                <Ionicons name="alert-circle" size={13} color="#b91c1c" />
                <Text className="text-xs text-red-600">{errors.email}</Text>
              </View>
            ) : null}
          </View>

          {/* Mot de passe */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Mot de passe <Text className="text-red-400">*</Text>
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={(v) => { setPassword(v); clearError("password"); }}
                secureTextEntry={!showPassword}
                placeholder="6 caractères min."
                returnKeyType="next"
                className={`border rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                style={{ paddingRight: 48 }}
                placeholderTextColor="#A08878"
                accessibilityLabel="Mot de passe"
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
            {errors.password ? (
              <View className="flex-row items-center gap-1 mt-1.5">
                <Ionicons name="alert-circle" size={13} color="#b91c1c" />
                <Text className="text-xs text-red-600">{errors.password}</Text>
              </View>
            ) : null}
          </View>

          {/* Ville */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ville (optionnel)</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Cayenne"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              placeholderTextColor="#A08878"
              accessibilityLabel="Ville"
              textContentType="addressCity"
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="rounded-xl py-3.5 items-center mt-2 mb-4 bg-accent"
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">Créer mon compte</Text>
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
            onPress={() => router.replace("/auth/login")}
            className="items-center py-2"
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-400">
              Déjà un compte ?{" "}
              <Text className="text-accent font-bold">Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
