import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBirdDetail } from "../../hooks/useVoliere";
import { Badge } from "../../components/ui/Badge";
import { AudioPlayer } from "../../components/audio/AudioPlayer";

const STATUS_VARIANT = { en_forme: "green", mue: "amber", reproduction: "blue", entrainement: "green" } as const;
const STATUS_LABEL = { en_forme: "En forme", mue: "Mue en cours", reproduction: "Reproduction", entrainement: "Entraînement" };
const LOG_ICON: Record<string, string> = { entrainement: "🎵", concours: "🏆", alimentation: "🍃", sante: "💊", note: "📝" };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );
}

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bird, logs, songs, loading } = useBirdDetail(id);
  const router = useRouter();

  if (loading || !bird) {
    return <View className="flex-1 bg-white items-center justify-center"><Text className="text-gray-400">Chargement…</Text></View>;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Hero */}
      <View className="bg-gray-50 px-5 py-5 flex-row items-center gap-4">
        <View className="w-[72px] h-[72px] rounded-2xl bg-white border border-gray-100 items-center justify-center">
          <Text className="text-4xl">🐦</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-semibold text-gray-900">{bird.name}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {bird.species === "pikolet" ? "Pikolèt" : "Lorti"} · {bird.gender === "male" ? "Mâle" : "Femelle"}
          </Text>
          <View className="flex-row gap-2 mt-2">
            <Badge label={STATUS_LABEL[bird.status]} variant={STATUS_VARIANT[bird.status]} />
          </View>
        </View>
      </View>

      <View className="px-5 pt-4">
        {/* Infos */}
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Informations</Text>
        {bird.ring_code && <InfoRow label="Bague" value={bird.ring_code} />}
        {bird.birth_date && <InfoRow label="Né le" value={new Date(bird.birth_date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} />}
        {bird.lineage && <InfoRow label="Lignée" value={bird.lineage} />}

        {/* Chants */}
        {songs.length > 0 && (
          <View className="mt-5">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ses chants</Text>
            {songs.map(song => (
              <AudioPlayer key={song.id} url={song.storage_url} youtubeUrl={song.youtube_url} duration={song.duration_seconds} title={song.title} />
            ))}
          </View>
        )}

        {/* Journal */}
        {logs.length > 0 && (
          <View className="mt-5">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Journal de suivi</Text>
            {logs.map(log => (
              <View key={log.id} className="flex-row items-start gap-2.5 py-2.5 border-b border-gray-50">
                <View className="w-8 h-8 rounded-[10px] bg-gray-100 items-center justify-center">
                  <Text className="text-sm">{LOG_ICON[log.log_type] ?? "📝"}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-700">{log.note ?? log.log_type}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {new Date(log.logged_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    {log.weight_g ? ` · ${log.weight_g}g` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bouton ajout log */}
        <TouchableOpacity
          onPress={() => router.push(`/bird/${id}/log`)}
          className="mt-6 bg-accent-light rounded-xl py-3 items-center"
        >
          <Text className="text-accent-dark font-semibold text-sm">+ Ajouter une entrée journal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
