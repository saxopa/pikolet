import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AudioPlayer } from "../audio/AudioPlayer";
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
  function confirmDelete() {
    Alert.alert("Supprimer ce chant ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => onDelete?.(song.id) },
    ]);
  }

  return (
    <View className="bg-white border border-gray-100 rounded-2xl mb-2.5 overflow-hidden">
      <View className="px-3.5 pt-3 pb-1 flex-row items-start gap-3">
        <View className="w-12 h-12 rounded-xl bg-accent-light items-center justify-center">
          <Text className="text-2xl">🎵</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>{song.title}</Text>
          <Text className="text-[11px] text-gray-500 mt-0.5">
            {song.bird?.species === "pikolet" ? "Pikolèt" : "Lorti"} · {song.bird?.name}
          </Text>
          {song.owner?.username && (
            <Text className="text-[11px] text-accent mt-0.5">Partagé par {song.owner.username}</Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {song.source_type === "youtube" && (
            <View className="bg-red-500 px-1.5 py-0.5 rounded">
              <Text className="text-white text-[9px] font-bold">YT</Text>
            </View>
          )}
          {onDelete && (
            <TouchableOpacity onPress={confirmDelete} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
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
