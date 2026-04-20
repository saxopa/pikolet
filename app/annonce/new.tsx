import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { createListing, uploadPostImage, getMyBirds } from "../../lib/supabase";
import { SPECIES_EMOJI } from "../../constants/species";
import type { Bird, ListingCategory, ListingPriceType } from "../../types";

const CATEGORIES: { key: ListingCategory; label: string; emoji: string }[] = [
  { key: "oiseau", label: "Oiseau", emoji: "🐦" },
  { key: "materiel", label: "Matériel", emoji: "🪚" },
  { key: "nourriture", label: "Nourriture", emoji: "🌾" },
  { key: "autre", label: "Autre", emoji: "📦" },
];

const PRICE_TYPES: { key: ListingPriceType; label: string }[] = [
  { key: "fixed", label: "Prix fixe" },
  { key: "negotiable", label: "À négocier" },
  { key: "free", label: "Gratuit" },
];

export default function NewListingScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("oiseau");
  const [priceType, setPriceType] = useState<ListingPriceType>("fixed");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [selectedBird, setSelectedBird] = useState<string>("");
  const [birds, setBirds] = useState<Bird[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyBirds(user.id).then(({ data }) => {
      if (data) setBirds(data as unknown as Bird[]);
    });
  }, [user]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageName(asset.fileName ?? `listing_${Date.now()}.jpg`);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) { toast("Titre requis", "error"); return; }
    if (!user) return;
    if (priceType !== "free" && price && isNaN(parseFloat(price))) {
      toast("Prix invalide", "error"); return;
    }

    setLoading(true);
    let image_url: string | undefined;

    if (imageUri) {
      const { url, error } = await uploadPostImage(user.id, imageUri, imageName, "image/jpeg");
      if (error || !url) {
        toast("Erreur upload image", "error");
        setLoading(false);
        return;
      }
      image_url = url;
    }

    const { error } = await createListing({
      seller_id: user.id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      price: priceType !== "free" && price ? parseFloat(price) : undefined,
      price_type: priceType,
      location: location.trim() || undefined,
      bird_id: category === "oiseau" && selectedBird ? selectedBird : undefined,
      image_url,
    });

    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Annonce publiée ✓");
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Catégorie */}
        <View className="mb-5">
          <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Catégorie *</Text>
          <View className="flex-row gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.key}
                onPress={() => { setCategory(c.key); setSelectedBird(""); }}
                className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${category === c.key ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Text>{c.emoji}</Text>
                <Text className={`text-sm ${category === c.key ? "text-accent-dark font-medium" : "text-gray-600"}`}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Titre */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Titre *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Pikolèt mâle champion 2024"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
            placeholderTextColor="#A08878"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Détails sur l'annonce…"
            multiline
            numberOfLines={4}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
            placeholderTextColor="#A08878"
            style={{ textAlignVertical: "top" }}
          />
        </View>

        {/* Oiseau lié (si catégorie oiseau) */}
        {category === "oiseau" && birds.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Lier à un oiseau</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedBird("")}
                className={`px-3.5 py-2 rounded-full border ${!selectedBird ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Text className={`text-sm ${!selectedBird ? "text-accent-dark font-medium" : "text-gray-500"}`}>Aucun</Text>
              </TouchableOpacity>
              {birds.map(b => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBird(b.id)}
                  className={`px-3.5 py-2 rounded-full border ${selectedBird === b.id ? "border-accent bg-accent-light" : "border-gray-200"}`}
                >
                  <Text className={`text-sm ${selectedBird === b.id ? "text-accent-dark font-medium" : "text-gray-600"}`}>
                    {SPECIES_EMOJI[b.species] ?? "🐦"} {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Prix */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Prix *</Text>
          <View className="flex-row gap-2 mb-3">
            {PRICE_TYPES.map(p => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPriceType(p.key)}
                className={`flex-1 py-2 rounded-xl border items-center ${priceType === p.key ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Text className={`text-sm ${priceType === p.key ? "text-accent-dark font-medium" : "text-gray-500"}`}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {priceType !== "free" && (
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
              placeholderTextColor="#A08878"
            />
          )}
        </View>

        {/* Localisation */}
        <View className="mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Localisation</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Cayenne, Martinique…"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50"
            placeholderTextColor="#A08878"
          />
        </View>

        {/* Photo */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Photo</Text>
          <TouchableOpacity
            onPress={pickImage}
            className={`border-2 border-dashed rounded-xl py-5 items-center gap-2 ${imageUri ? "border-accent bg-accent-light" : "border-gray-200"}`}
          >
            <Ionicons
              name={imageUri ? "checkmark-circle" : "camera-outline"}
              size={26}
              color={imageUri ? "#B85C38" : "#C8B49E"}
            />
            <Text className={`text-sm font-medium ${imageUri ? "text-accent-dark" : "text-gray-400"}`}>
              {imageUri ? "Photo sélectionnée — appuyer pour changer" : "Ajouter une photo"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center ${loading ? "bg-accent/60" : "bg-accent"}`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">
            {loading ? "Publication…" : "Publier l'annonce"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
