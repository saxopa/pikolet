import { View, Text, TouchableOpacity, Image } from "react-native";
import { Badge } from "../ui/Badge";
import { SPECIES_EMOJI, SPECIES_LABEL } from "../../constants/species";
import type { Bird } from "../../types";

const STATUS_VARIANT = {
  en_forme: "green",
  mue: "amber",
  reproduction: "blue",
  entrainement: "green",
} as const;

const STATUS_LABEL = {
  en_forme: "En forme",
  mue: "Mue en cours",
  reproduction: "Reproduction",
  entrainement: "Entraînement",
};

type Props = { bird: Bird; onPress: () => void };

export function BirdCard({ bird, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden"
      activeOpacity={0.85}
      style={{
        shadowColor: "#1C1209",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {bird.image_url ? (
        <Image
          source={{ uri: bird.image_url }}
          style={{ width: "100%", height: 96 }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-24 bg-gray-50 items-center justify-center">
          <Text className="text-5xl">{SPECIES_EMOJI[bird.species] ?? "🐦"}</Text>
        </View>
      )}
      <View className="p-3 pt-2.5">
        <Text className="text-sm font-semibold text-gray-900">{bird.name}</Text>
        <Text className="text-[11px] text-gray-500 mb-2">
          {SPECIES_LABEL[bird.species] ?? bird.species} · {bird.gender === "male" ? "Mâle" : "Femelle"}
        </Text>
        <Badge label={STATUS_LABEL[bird.status]} variant={STATUS_VARIANT[bird.status]} />
        {bird.ring_code && (
          <Text className="text-[10px] text-gray-400 mt-1.5">{bird.ring_code}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
