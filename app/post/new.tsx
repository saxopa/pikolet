import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { createPost, linkSongToPost, getMySongs, uploadPostImage, uploadPostAudio } from "../../lib/supabase";
import type { BirdSong } from "../../types";

type AttachedImage = { uri: string; name: string; mimeType: string };
type AttachedAudio = { uri: string; name: string; mimeType: string };

export default function NewPostScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [songs, setSongs] = useState<BirdSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<AttachedAudio | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMySongs(user.id).then(({ data }) => { if (data) setSongs(data as unknown as BirdSong[]); });
  }, [user]);

  async function pickImage() {
    const result = await DocumentPicker.getDocumentAsync({ type: "image/*", copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setAttachedImage({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? "image/jpeg" });
  }

  async function pickAudio() {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*", copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setAttachedAudio({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? "audio/mpeg" });
  }

  function toggleYoutubeInput() {
    setShowYoutubeInput(v => !v);
    if (showYoutubeInput) setYoutubeUrl("");
  }

  async function handlePost() {
    const hasContent = content.trim().length > 0;
    const hasMedia = attachedImage || attachedAudio || youtubeUrl.trim().length > 0;
    if (!hasContent && !hasMedia && !selectedSong) {
      toast("Ajoute du texte, un média ou un chant.", "error");
      return;
    }
    if (!user) return;
    setLoading(true);

    let image_url: string | undefined;
    let audio_url: string | undefined;

    if (attachedImage || attachedAudio) {
      toast("Upload en cours…");
    }

    if (attachedImage) {
      const { url, error } = await uploadPostImage(user.id, attachedImage.uri, attachedImage.name, attachedImage.mimeType);
      if (error || !url) {
        toast(error?.message ?? "Erreur upload image", "error");
        setLoading(false);
        return;
      }
      image_url = url;
    }

    if (attachedAudio) {
      const { url, error } = await uploadPostAudio(user.id, attachedAudio.uri, attachedAudio.name, attachedAudio.mimeType);
      if (error || !url) {
        toast(error?.message ?? "Erreur upload audio", "error");
        setLoading(false);
        return;
      }
      audio_url = url;
    }

    const media = {
      ...(image_url ? { image_url } : {}),
      ...(audio_url ? { audio_url } : {}),
      ...(youtubeUrl.trim() ? { youtube_url: youtubeUrl.trim() } : {}),
    };

    const { data, error } = await createPost(user.id, content.trim(), Object.keys(media).length > 0 ? media : undefined);
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

  const ytConfirmed = youtubeUrl.trim().length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="Partage une observation, une victoire, un chant…"
          className="text-sm text-gray-900 leading-6 mb-4"
          placeholderTextColor="#A08878"
          style={{ minHeight: 100, textAlignVertical: "top" }}
          autoFocus
        />

        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity
            onPress={pickImage}
            disabled={!!attachedImage}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${attachedImage ? "border-accent bg-accent-light" : "border-gray-200"}`}
          >
            <Text className={`text-xs font-medium ${attachedImage ? "text-accent-dark" : "text-gray-600"}`}>📷 Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickAudio}
            disabled={!!attachedAudio}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${attachedAudio ? "border-accent bg-accent-light" : "border-gray-200"}`}
          >
            <Text className={`text-xs font-medium ${attachedAudio ? "text-accent-dark" : "text-gray-600"}`}>🎵 Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleYoutubeInput}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${ytConfirmed || showYoutubeInput ? "border-accent bg-accent-light" : "border-gray-200"}`}
          >
            <Text className={`text-xs font-medium ${ytConfirmed || showYoutubeInput ? "text-accent-dark" : "text-gray-600"}`}>▶ YouTube</Text>
          </TouchableOpacity>
        </View>

        {showYoutubeInput && (
          <TextInput
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://youtube.com/watch?v=…"
            className="text-xs text-gray-900 border border-gray-200 rounded-xl px-3 py-2 mb-3"
            placeholderTextColor="#A08878"
            autoCapitalize="none"
            keyboardType="url"
          />
        )}

        {(attachedImage || attachedAudio || ytConfirmed) && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {attachedImage && (
              <View className="rounded-xl overflow-hidden mb-2" style={{ width: "100%" }}>
                <Image source={{ uri: attachedImage.uri }} style={{ width: "100%", height: 160, borderRadius: 12 }} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => setAttachedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5"
                >
                  <Text className="text-white text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {attachedAudio && (
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
                <Text className="text-xs text-gray-700" numberOfLines={1} style={{ maxWidth: 200 }}>🎵 {attachedAudio.name}</Text>
                <TouchableOpacity onPress={() => setAttachedAudio(null)}>
                  <Text className="text-gray-400 text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {ytConfirmed && (
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
                <Text className="text-xs text-gray-700" numberOfLines={1} style={{ maxWidth: 200 }}>▶ {youtubeUrl.trim()}</Text>
                <TouchableOpacity onPress={() => { setYoutubeUrl(""); setShowYoutubeInput(false); }}>
                  <Text className="text-gray-400 text-xs">✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
          className={`rounded-xl py-3.5 items-center mb-6 ${loading ? "bg-accent/60" : "bg-accent"}`}
        >
          <Text className="text-white font-semibold">{loading ? "Publication…" : "Publier"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
