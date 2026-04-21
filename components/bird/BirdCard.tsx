import { View, Text, TouchableOpacity } from "react-native";
import { Badge } from "../ui/Badge";
import { SPECIES_EMOJI, SPECIES_LABEL } from "../../constants/species";
import type { Bird } from "../../types";
import Animated from 'react-native-reanimated';

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
      className="bg-[#1C1C1E] rounded-2xl overflow-hidden relative"
      activeOpacity={0.85}
      style={{
        height: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {bird.image_url ? (
        <Animated.Image
          sharedTransitionTag={`bird-image-${bird.id}`}
          source={{ uri: bird.image_url }}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 bg-gray-800 items-center justify-center">
          <Text className="text-6xl">{SPECIES_EMOJI[bird.species] ?? "🐦"}</Text>
        </View>
      )}

      {/* Assombrir pour lisibilité */}
      <View className="absolute inset-0 bg-black/30" />

      {/* Top badges */}
      <View className="flex-row justify-between items-start p-3 absolute top-0 w-full z-10">
        <Badge label={STATUS_LABEL[bird.status]} variant={STATUS_VARIANT[bird.status]} />
        <View className="bg-black/40 rounded-full px-2 py-1 items-center justify-center">
           <Text className="text-white text-[10px] font-bold">{SPECIES_EMOJI[bird.species] ?? "🐦"}</Text>
        </View>
      </View>

      {/* Bottom Info */}
      <View className="absolute bottom-0 w-full bg-black/50 pt-4 p-3 backdrop-blur-[2px]">
        <Text className="text-[17px] font-bold text-white mb-0.5" numberOfLines={1}>{bird.name}</Text>
        <Text className="text-[11px] text-white/80 mb-1">
          {SPECIES_LABEL[bird.species] ?? bird.species} · {bird.gender === "male" ? "Mâle ♂" : "Femelle ♀"}
        </Text>
        
        {bird.ring_code && (
          <View className="flex-row items-center mt-1">
            <View className="w-1.5 h-1.5 rounded-full bg-[#B85C38] mr-1.5" />
            <Text className="text-[10px] text-white/60 font-mono tracking-widest">{bird.ring_code}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
