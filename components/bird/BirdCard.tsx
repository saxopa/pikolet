import { View, Text, TouchableOpacity } from "react-native";
import { Badge } from "../ui/Badge";
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

const SPECIES_EMOJI: Record<string, string> = { pikolet: "🐤", lorti: "🦜" };

type Props = { bird: Bird; onPress: () => void };

export function BirdCard({ bird, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-2xl p-3.5"
      activeOpacity={0.85}
    >
      <Text className="text-3xl mb-2">{SPECIES_EMOJI[bird.species] ?? "🐦"}</Text>
      <Text className="text-sm font-semibold text-gray-900">{bird.name}</Text>
      <Text className="text-[11px] text-gray-500 mb-2">
        {bird.species === "pikolet" ? "Pikolèt" : "Lorti"} · {bird.gender === "male" ? "Mâle" : "Femelle"}
      </Text>
      <Badge label={STATUS_LABEL[bird.status]} variant={STATUS_VARIANT[bird.status]} />
      {bird.ring_code && (
        <Text className="text-[10px] text-gray-400 mt-1.5">{bird.ring_code}</Text>
      )}
    </TouchableOpacity>
  );
}
