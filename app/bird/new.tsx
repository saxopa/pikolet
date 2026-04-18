import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { createBird } from "../../lib/supabase";
import type { BirdSpecies, BirdGender, BirdStatus } from "../../types";

function Picker<T extends string>({ label, options, value, onChange }: { label: string; options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-medium text-gray-600 mb-2">{label}</Text>
      <View className="flex-row gap-2 flex-wrap">
        {options.map(o => (
          <TouchableOpacity
            key={o.key}
            onPress={() => onChange(o.key)}
            className={`px-4 py-2 rounded-full border ${value === o.key ? "bg-accent border-accent" : "border-gray-200"}`}
          >
            <Text className={`text-sm ${value === o.key ? "text-white font-medium" : "text-gray-600"}`}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function NewBirdScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<BirdSpecies>("pikolet");
  const [gender, setGender] = useState<BirdGender>("male");
  const [status, setStatus] = useState<BirdStatus>("en_forme");
  const [ringCode, setRingCode] = useState("");
  const [lineage, setLineage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) { Alert.alert("Nom requis"); return; }
    if (!user) { Alert.alert("Non connecté"); return; }
    setLoading(true);
    const { error } = await createBird({
      owner_id: user.id, name: name.trim(), species, gender,
      status, ring_code: ringCode.trim() || null,
      lineage: lineage.trim() || null,
      is_public: true, birth_date: null, father_id: null, mother_id: null,
    });
    setLoading(false);
    if (error) Alert.alert("Erreur", error.message);
    else { Alert.alert("✓ Oiseau ajouté !"); router.back(); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Nom *</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ex: Prodige" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
        </View>

        <Picker label="Espèce *" value={species} onChange={setSpecies} options={[{ key: "pikolet", label: "Pikolèt" }, { key: "lorti", label: "Lorti" }]} />
        <Picker label="Sexe *" value={gender} onChange={setGender} options={[{ key: "male", label: "Mâle" }, { key: "femelle", label: "Femelle" }]} />
        <Picker label="Statut" value={status} onChange={setStatus} options={[
          { key: "en_forme", label: "En forme" }, { key: "mue", label: "Mue" },
          { key: "reproduction", label: "Reproduction" }, { key: "entrainement", label: "Entraînement" },
        ]} />

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Bague (optionnel)</Text>
          <TextInput value={ringCode} onChangeText={setRingCode} placeholder="GUY-2024-001" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
        </View>

        <View className="mb-6">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Lignée (optionnel)</Text>
          <TextInput value={lineage} onChangeText={setLineage} placeholder="Ex: Kaw × Suriname" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
        </View>

        <TouchableOpacity onPress={handleCreate} disabled={loading} className={`rounded-xl py-3.5 items-center ${loading ? "bg-accent/60" : "bg-accent"}`}>
          <Text className="text-white font-semibold">{loading ? "Enregistrement…" : "Ajouter l'oiseau"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
