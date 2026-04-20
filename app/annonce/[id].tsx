import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Alert, Platform, Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { getListing, updateListingStatus, deleteListing, getOrCreateConversation } from "../../lib/supabase";
import type { Enums } from "../../types/database";
import type { Listing } from "../../types";

type ListingFull = Listing & {
  seller: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    location: string | null;
  };
};

const CATEGORY_EMOJI: Record<string, string> = {
  oiseau: "🐦", materiel: "🪚", nourriture: "🌾", autre: "📦",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Disponible", sold: "Vendu", reserved: "Réservé",
};

const STATUS_COLOR: Record<string, string> = {
  active: "text-forest-dark bg-forest-light",
  sold: "text-gray-500 bg-gray-100",
  reserved: "text-gold-dark bg-gold-light",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [listing, setListing] = useState<ListingFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getListing(id).then(({ data }) => {
      if (data) setListing(data as unknown as ListingFull);
      setLoading(false);
    });
  }, [id]);

  const isOwner = user?.id === listing?.seller_id;

  async function handleStatusChange(status: Enums<"listing_status">) {
    if (!listing) return;
    await updateListingStatus(listing.id, status);
    setListing(prev => prev ? { ...prev, status } : prev);
    toast(`Annonce marquée "${STATUS_LABEL[status]}"`);
  }

  function confirmDelete() {
    const doDelete = async () => {
      await deleteListing(listing!.id);
      toast("Annonce supprimée");
      router.back();
    };
    if (Platform.OS === "web") {
      if ((window as any).confirm("Supprimer cette annonce ?")) doDelete();
      return;
    }
    Alert.alert("Supprimer l'annonce ?", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: doDelete },
    ]);
  }

  async function contactSeller() {
    if (!user || !listing?.seller_id) return;
    if (user.id === listing.seller_id) return;
    const { id: convId, error } = await getOrCreateConversation(user.id, listing.seller_id);
    if (error || !convId) { toast("Impossible d'ouvrir la conversation", "error"); return; }
    const display = listing.seller?.display_name ?? listing.seller?.username ?? "";
    router.push(`/conversation/${convId}?username=${listing.seller.username}&display=${display}`);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Chargement…</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-4xl mb-3">🔍</Text>
        <Text className="text-gray-500 text-center">Annonce introuvable</Text>
      </View>
    );
  }

  const priceLabel =
    listing.price_type === "free"
      ? "Gratuit"
      : listing.price_type === "negotiable"
      ? listing.price != null ? `${listing.price} € (à négocier)` : "Prix à négocier"
      : listing.price != null ? `${listing.price} €` : "—";

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
      {listing.image_url ? (
        <Image
          source={{ uri: listing.image_url }}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-36 bg-accent-light items-center justify-center">
          <Text style={{ fontSize: 56 }}>{CATEGORY_EMOJI[listing.category] ?? "📦"}</Text>
        </View>
      )}

      <View className="px-5 pt-4">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="text-xl font-bold text-gray-900 flex-1 font-display">{listing.title}</Text>
          <View className={`px-2.5 py-1 rounded-full ${STATUS_COLOR[listing.status]}`}>
            <Text className="text-[11px] font-semibold">{STATUS_LABEL[listing.status]}</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-accent mt-2">{priceLabel}</Text>

        <View className="flex-row items-center gap-4 mt-3">
          {(listing.location ?? listing.seller?.location) && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={13} color="#A08878" />
              <Text className="text-xs text-gray-500">{listing.location ?? listing.seller?.location}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color="#A08878" />
            <Text className="text-xs text-gray-500">
              {new Date(listing.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </Text>
          </View>
        </View>

        {listing.description ? (
          <View className="mt-4 p-4 bg-gray-50 rounded-xl">
            <Text className="text-sm text-gray-700 leading-relaxed">{listing.description}</Text>
          </View>
        ) : null}

        {/* Vendeur */}
        <TouchableOpacity
          onPress={contactSeller}
          className="mt-4 flex-row items-center gap-3 p-4 bg-gray-50 rounded-xl"
          activeOpacity={0.75}
        >
          <View className="w-10 h-10 rounded-full bg-forest-light items-center justify-center">
            <Text className="text-forest-dark font-bold text-sm">
              {(listing.seller?.username ?? "?")[0].toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-400">Vendeur</Text>
            <Text className="text-sm font-semibold text-gray-900">{listing.seller?.username}</Text>
            {listing.seller?.location && (
              <Text className="text-xs text-gray-400">{listing.seller.location}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C8B49E" />
        </TouchableOpacity>

        {/* Actions vendeur */}
        {isOwner && (
          <View className="mt-4 gap-2">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Gérer l'annonce</Text>
            <View className="flex-row gap-2">
              {listing.status !== "reserved" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("reserved")}
                  className="flex-1 py-2.5 rounded-xl border border-gold-dark bg-gold-light items-center"
                >
                  <Text className="text-sm font-medium text-gold-dark">Marquer réservé</Text>
                </TouchableOpacity>
              )}
              {listing.status !== "sold" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("sold")}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-gray-100 items-center"
                >
                  <Text className="text-sm font-medium text-gray-600">Marquer vendu</Text>
                </TouchableOpacity>
              )}
              {listing.status !== "active" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("active")}
                  className="flex-1 py-2.5 rounded-xl border border-forest bg-forest-light items-center"
                >
                  <Text className="text-sm font-medium text-forest-dark">Remettre actif</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={confirmDelete} className="py-2.5 items-center">
              <Text className="text-sm text-red-400">Supprimer l'annonce</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton contact (non-vendeur) */}
        {!isOwner && listing.status === "active" && (
          <TouchableOpacity
            onPress={contactSeller}
            className="mt-4 bg-accent rounded-xl py-3.5 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold">Contacter le vendeur</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
