import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Listing } from "../../types";

type ListingWithSeller = Listing & {
  seller: { id: string; username: string; display_name: string | null; location: string | null };
};

const CATEGORY_LABEL: Record<string, string> = {
  oiseau: "Oiseau",
  materiel: "Matériel",
  nourriture: "Nourriture",
  autre: "Autre",
};

const CATEGORY_EMOJI: Record<string, string> = {
  oiseau: "🐦",
  materiel: "🪚",
  nourriture: "🌾",
  autre: "📦",
};

type Props = {
  listing: ListingWithSeller;
  onPress: () => void;
};

export function ListingCard({ listing, onPress }: Props) {
  const priceLabel =
    listing.price_type === "free"
      ? "Gratuit"
      : listing.price_type === "negotiable"
      ? listing.price != null
        ? `${listing.price} € (négo)`
        : "Prix à négocier"
      : listing.price != null
      ? `${listing.price} €`
      : "—";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl overflow-hidden mb-3"
      style={{
        shadowColor: "#1C1209",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {listing.image_url ? (
        <Image
          source={{ uri: listing.image_url }}
          style={{ width: "100%", height: 140 }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-24 bg-accent-light items-center justify-center">
          <Text style={{ fontSize: 36 }}>{CATEGORY_EMOJI[listing.category] ?? "📦"}</Text>
        </View>
      )}

      <View className="px-3.5 pt-2.5 pb-3">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="text-sm font-semibold text-gray-900 flex-1" numberOfLines={2}>
            {listing.title}
          </Text>
          <View className="bg-accent-light px-2 py-0.5 rounded-full mt-0.5">
            <Text className="text-[10px] text-accent-dark font-medium">
              {CATEGORY_LABEL[listing.category] ?? listing.category}
            </Text>
          </View>
        </View>

        <Text className="text-base font-bold text-accent mt-1">{priceLabel}</Text>

        <View className="flex-row items-center gap-3 mt-2">
          {(listing.location ?? listing.seller?.location) && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={11} color="#A08878" />
              <Text className="text-[11px] text-gray-400" numberOfLines={1}>
                {listing.location ?? listing.seller?.location}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="person-outline" size={11} color="#A08878" />
            <Text className="text-[11px] text-gray-400">{listing.seller?.username}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
