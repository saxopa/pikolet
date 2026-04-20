import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AudioPlayer } from "../audio/AudioPlayer";
import { useOfflineSongs } from "../../hooks/useOfflineSongs";
import type { SongWithMeta } from "../../hooks/useChants";

const SONG_TYPE_LABEL: Record<string, string> = {
  chant_libre: "Chant libre",
  cage_collee: "Cage collée",
  femelle: "Femelle",
  stimulation: "Stimulation",
};

type Props = {
  song: SongWithMeta;
  onDelete?: (songId: string) => void;
};

export function SongCard({ song, onDelete }: Props) {
  const router = useRouter();
  const { download, remove, getLocalUri, isDownloaded, isDownloading } = useOfflineSongs();
  const localUri = getLocalUri(song.id);
  const downloaded = isDownloaded(song.id);
  const downloading = isDownloading(song.id);
  const canDownload = !!song.storage_url && !song.youtube_url;

  function handleWebDownload() {
    const a = document.createElement("a");
    a.href = song.storage_url!;
    a.download = song.title + ".mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      if ((window as any).confirm("Supprimer ce chant ? Cette action est irréversible.")) {
        onDelete?.(song.id);
      }
      return;
    }
    Alert.alert("Supprimer ce chant ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => onDelete?.(song.id) },
    ]);
  }

  return (
    <View
      className="bg-white rounded-2xl mb-2.5 overflow-hidden"
      style={{
        shadowColor: "#1C1209",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="px-3.5 pt-3 pb-1 flex-row items-start gap-3">
        <View className="w-12 h-12 rounded-xl bg-forest-light items-center justify-center">
          <Text className="text-2xl">🎵</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>{song.title}</Text>
          <Text className="text-[11px] text-gray-500 mt-0.5">
            {song.bird?.species === "pikolet" ? "Pikolèt" : "Lorti"} · {song.bird?.name}
          </Text>
          {song.owner?.username && (
            <TouchableOpacity onPress={() => router.push(`/profile/${song.owner.username}`)}>
              <Text className="text-[11px] text-forest mt-0.5">Partagé par {song.owner.username}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {song.source_type === "youtube" && (
            <View className="bg-red-500 px-1.5 py-0.5 rounded">
              <Text className="text-white text-[9px] font-bold">YT</Text>
            </View>
          )}
          {canDownload && (
            Platform.OS === "web" ? (
              <TouchableOpacity onPress={handleWebDownload} hitSlop={8}>
                <Ionicons name="arrow-down-circle-outline" size={18} color="#C8B49E" />
              </TouchableOpacity>
            ) : downloading ? (
              <ActivityIndicator size={14} color="#C8B49E" />
            ) : (
              <TouchableOpacity
                onPress={() => downloaded ? remove(song.id) : download(song.id, song.storage_url!)}
                hitSlop={8}
              >
                <Ionicons
                  name={downloaded ? "checkmark-circle" : "arrow-down-circle-outline"}
                  size={18}
                  color={downloaded ? "#1E7A4F" : "#C8B49E"}
                />
              </TouchableOpacity>
            )
          )}
          {onDelete && (
            <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#C8B49E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-3.5 pb-2">
        <AudioPlayer
          url={song.storage_url}
          youtubeUrl={song.youtube_url}
          duration={song.duration_seconds}
          title={song.title}
          localUri={localUri}
        />
      </View>

      <View className="flex-row gap-1.5 px-3.5 pb-3 flex-wrap">
        {song.song_type && (
          <View className="bg-gray-100 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] text-gray-500">{SONG_TYPE_LABEL[song.song_type] ?? song.song_type}</Text>
          </View>
        )}
        <View className="bg-gray-100 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] text-gray-500">{song.play_count} écoutes</Text>
        </View>
      </View>
    </View>
  );
}
