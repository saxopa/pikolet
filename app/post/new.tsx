import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { createPost, linkSongToPost, getMySongs } from "../../lib/supabase";
import type { BirdSong } from "../../types";

export default function NewPostScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [songs, setSongs] = useState<BirdSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMySongs(user.id).then(({ data }) => { if (data) setSongs(data as unknown as BirdSong[]); });
  }, [user]);

  async function handlePost() {
    if (!content.trim() && !selectedSong) { toast("Ajoute du texte ou un chant.", "error"); return; }
    if (!user) return;
    setLoading(true);
    const { data, error } = await createPost(user.id, content.trim());
    if (error || !data) {
      toast(error?.message ?? "Erreur lors de la publication", "error");
      setLoading(false);
      return;
    }
    if (selectedSong) await linkSongToPost(data.id, selectedSong);
    setLoading(false);
    toast("Post publié ✓");
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-4">
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="Partage une observation, une victoire, un chant…"
          className="text-sm text-gray-900 leading-6 mb-4"
          placeholderTextColor="#9CA3AF"
          style={{ minHeight: 100, textAlignVertical: "top" }}
          autoFocus
        />

        {songs.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-medium text-gray-500 mb-2">Attacher un chant</Text>
            <FlatList
              horizontal
              data={songs}
              keyExtractor={s => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedSong(selectedSong === item.id ? null : item.id)}
                  className={`px-3 py-2 rounded-xl border ${selectedSong === item.id ? "border-accent bg-accent-light" : "border-gray-200"}`}
                >
                  <Text className={`text-[11px] font-medium ${selectedSong === item.id ? "text-accent-dark" : "text-gray-600"}`} numberOfLines={1}>
                    🎵 {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mt-auto mb-6 ${loading ? "bg-accent/60" : "bg-accent"}`}
        >
          <Text className="text-white font-semibold">{loading ? "Publication…" : "Publier"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
