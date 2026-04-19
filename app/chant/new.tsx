import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { getMyBirds, addSong, uploadBirdSong } from "../../lib/supabase";
import type { Bird, SongType } from "../../types";

const SONG_TYPES: { key: SongType; label: string }[] = [
  { key: "chant_libre", label: "Chant libre" },
  { key: "cage_collee", label: "Cage collée" },
  { key: "femelle", label: "Femelle" },
  { key: "stimulation", label: "Stimulation" },
];

const SPECIES_EMOJI: Record<string, string> = { pikolet: "🐤", lorti: "🦜" };

type SourceMode = "youtube" | "file";

export default function NewSongScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [birds, setBirds] = useState<Bird[]>([]);
  const [selectedBird, setSelectedBird] = useState<string>("");
  const [title, setTitle] = useState("");
  const [songType, setSongType] = useState<SongType>("chant_libre");
  const [sourceMode, setSourceMode] = useState<SourceMode>("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyBirds(user.id).then(({ data }) => {
      if (data) {
        setBirds(data as unknown as Bird[]);
        if (data.length > 0) setSelectedBird(data[0].id);
      }
    });
  }, [user]);

  async function pickAudio() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAudioFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "audio/mpeg",
      });
      if (!title) setTitle(asset.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleSave() {
    if (!title.trim()) { toast("Titre requis", "error"); return; }
    if (!selectedBird) { toast("Sélectionne un oiseau", "error"); return; }
    if (sourceMode === "youtube" && !youtubeUrl.trim()) { toast("Lien YouTube requis", "error"); return; }
    if (sourceMode === "file" && !audioFile) { toast("Sélectionne un fichier audio", "error"); return; }
    if (!user) return;

    setLoading(true);

    let storageUrl: string | null = null;
    let ytUrl: string | null = null;

    if (sourceMode === "file" && audioFile) {
      const { url, error } = await uploadBirdSong(user.id, audioFile.uri, audioFile.name, audioFile.mimeType);
      if (error || !url) {
        toast("Erreur upload audio : " + (error as any)?.message, "error");
        setLoading(false);
        return;
      }
      storageUrl = url;
    } else {
      ytUrl = youtubeUrl.trim();
    }

    const { error } = await addSong({
      bird_id: selectedBird,
      owner_id: user.id,
      title: title.trim(),
      song_type: songType,
      source_type: sourceMode === "file" ? "storage" : "youtube",
      youtube_url: ytUrl,
      storage_url: storageUrl,
      duration_seconds: null,
      is_public: true,
      recorded_at: null,
    });
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Chant ajouté ✓");
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Titre *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ex: Chant des marais de Kaw" className="border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholderTextColor="#9CA3AF" />
        </View>

        {birds.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-2">Oiseau *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {birds.map(b => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBird(b.id)}
                  className={`px-3.5 py-2 rounded-full border ${selectedBird === b.id ? "border-accent bg-accent-light" : "border-gray-200"}`}
                >
                  <Text className={`text-sm ${selectedBird === b.id ? "text-accent-dark font-medium" : "text-gray-600"}`}>
                    {SPECIES_EMOJI[b.species] ?? "🐦"} {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-2">Type de chant</Text>
          <View className="flex-row flex-wrap gap-2">
            {SONG_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSongType(t.key)}
                className={`px-3.5 py-2 rounded-full border ${songType === t.key ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Text className={`text-sm ${songType === t.key ? "text-accent-dark font-medium" : "text-gray-600"}`}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggle source */}
        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-2">Source audio *</Text>
          <View className="flex-row gap-2 mb-3">
            {(["file", "youtube"] as SourceMode[]).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setSourceMode(mode)}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${sourceMode === mode ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Ionicons
                  name={mode === "file" ? "musical-note" : "logo-youtube"}
                  size={16}
                  color={sourceMode === mode ? "#0F6E56" : "#6B7280"}
                />
                <Text className={`text-sm font-medium ${sourceMode === mode ? "text-accent-dark" : "text-gray-500"}`}>
                  {mode === "file" ? "Fichier audio" : "YouTube"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {sourceMode === "file" ? (
            <TouchableOpacity
              onPress={pickAudio}
              className={`border-2 border-dashed rounded-xl py-5 items-center gap-2 ${audioFile ? "border-accent bg-accent-light" : "border-gray-200"}`}
            >
              <Ionicons
                name={audioFile ? "checkmark-circle" : "cloud-upload-outline"}
                size={28}
                color={audioFile ? "#1D9E75" : "#9CA3AF"}
              />
              <Text className={`text-sm font-medium ${audioFile ? "text-accent-dark" : "text-gray-400"}`}>
                {audioFile ? audioFile.name : "Appuyer pour choisir un fichier"}
              </Text>
              {audioFile && (
                <Text className="text-xs text-accent">Changer de fichier</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TextInput
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="https://youtube.com/watch?v=..."
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="url"
            />
          )}
        </View>

        <TouchableOpacity onPress={handleSave} disabled={loading} className={`rounded-xl py-3.5 items-center mt-2 ${loading ? "bg-accent/60" : "bg-accent"}`}>
          <Text className="text-white font-semibold">
            {loading ? (sourceMode === "file" ? "Upload en cours…" : "Enregistrement…") : "Ajouter le chant"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
