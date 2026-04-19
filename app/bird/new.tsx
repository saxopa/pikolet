import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { createBird, updateBird, uploadBirdImage } from "../../lib/supabase";
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

const SPECIES_EMOJI: Record<string, string> = { pikolet: "🐤", lorti: "🦜" };

export default function NewBirdScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<BirdSpecies>("pikolet");
  const [gender, setGender] = useState<BirdGender>("male");
  const [status, setStatus] = useState<BirdStatus>("en_forme");
  const [ringCode, setRingCode] = useState("");
  const [lineage, setLineage] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleCreate() {
    if (!name.trim()) { toast("Nom requis", "error"); return; }
    if (!user) { toast("Non connecté", "error"); return; }
    setLoading(true);

    const { data, error } = await createBird({
      owner_id: user.id, name: name.trim(), species, gender,
      status, ring_code: ringCode.trim() || null,
      lineage: lineage.trim() || null,
      is_public: true, birth_date: null, father_id: null, mother_id: null,
      image_url: null,
    });

    if (error || !data) {
      toast(error?.message ?? "Erreur", "error");
      setLoading(false);
      return;
    }

    if (imageUri) {
      const fileName = imageUri.split("/").pop() ?? "bird.jpg";
      const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
      const { url, error: imgError } = await uploadBirdImage(user.id, imageUri, fileName, mimeType);
      if (!imgError && url) {
        await updateBird(data.id, { image_url: url });
      }
    }

    setLoading(false);
    toast("Oiseau ajouté ✓");
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Photo oiseau */}
        <View className="items-center mb-5">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 96, height: 96, borderRadius: 20 }} />
            ) : (
              <View style={{ width: 96, height: 96, borderRadius: 20 }} className="bg-gray-100 items-center justify-center border border-dashed border-gray-300">
                <Text className="text-4xl">{SPECIES_EMOJI[species] ?? "🐦"}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={13} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-gray-400 mt-2">Ajouter une photo (optionnel)</Text>
        </View>

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Nom *</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ex: Prodige" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
        </View>

        <Picker label="Espèce *" value={species} onChange={setSpecies} options={[{ key: "pikolet", label: "🐤 Pikolèt" }, { key: "lorti", label: "🦜 Lorti" }]} />
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
