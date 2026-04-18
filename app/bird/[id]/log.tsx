import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addBirdLog } from "../../../lib/supabase";
import type { LogType } from "../../../types";

const LOG_TYPES: { key: LogType; label: string; icon: string }[] = [
  { key: "entrainement", label: "Entraînement", icon: "🎵" },
  { key: "concours", label: "Concours", icon: "🏆" },
  { key: "alimentation", label: "Alimentation", icon: "🍃" },
  { key: "sante", label: "Santé", icon: "💊" },
  { key: "note", label: "Note", icon: "📝" },
];

export default function AddLogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [type, setType] = useState<LogType>("entrainement");
  const [note, setNote] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const { error } = await addBirdLog({
      bird_id: id,
      log_type: type,
      note: note.trim() || null,
      weight_g: weight ? parseFloat(weight) : null,
      logged_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) Alert.alert("Erreur", error.message);
    else { Alert.alert("✓ Entrée ajoutée"); router.back(); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Text className="text-xs font-medium text-gray-600 mb-2">Type d'entrée</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {LOG_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setType(t.key)}
              className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${type === t.key ? "bg-accent border-accent" : "border-gray-200"}`}
            >
              <Text>{t.icon}</Text>
              <Text className={`text-sm ${type === t.key ? "text-white font-medium" : "text-gray-600"}`}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs font-medium text-gray-600 mb-1.5">Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          placeholder="Décris la séance, les observations…"
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4"
          placeholderTextColor="#9CA3AF"
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        <Text className="text-xs font-medium text-gray-600 mb-1.5">Poids (g) — optionnel</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="Ex: 12.5"
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm mb-6"
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity onPress={handleSave} disabled={loading} className={`rounded-xl py-3.5 items-center ${loading ? "bg-accent/60" : "bg-accent"}`}>
          <Text className="text-white font-semibold">{loading ? "Enregistrement…" : "Enregistrer"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
