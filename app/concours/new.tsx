import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { getMyBirds, createCompetition } from "../../lib/supabase";
import type { Bird } from "../../types";

const SPECIES_EMOJI: Record<string, string> = { pikolet: "🐤", lorti: "🦜" };
const RANK_OPTIONS = [
  { label: "1er", value: 1 },
  { label: "2ème", value: 2 },
  { label: "3ème", value: 3 },
  { label: "Autre", value: 0 },
];

const today = new Date().toISOString().split("T")[0];

export default function NewConcoursScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { birdId: paramBirdId } = useLocalSearchParams<{ birdId?: string }>();

  const [birds, setBirds] = useState<Bird[]>([]);
  const [selectedBird, setSelectedBird] = useState<string>("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(today);
  const [rankChoice, setRankChoice] = useState<number>(1);
  const [customRank, setCustomRank] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyBirds(user.id).then(({ data }) => {
      if (data) {
        setBirds(data as unknown as Bird[]);
        if (paramBirdId) {
          setSelectedBird(paramBirdId);
        } else if (data.length > 0) {
          setSelectedBird(data[0].id);
        }
      }
    });
  }, [user, paramBirdId]);

  async function handleSave() {
    if (!name.trim()) { toast("Nom du concours requis", "error"); return; }
    if (!selectedBird) { toast("Sélectionne un oiseau", "error"); return; }
    if (!date.trim()) { toast("Date requise", "error"); return; }
    if (!user) return;

    const rank = rankChoice === 0 ? parseInt(customRank, 10) : rankChoice;
    if (rankChoice === 0 && (!customRank.trim() || isNaN(rank) || rank < 1)) {
      toast("Classement invalide", "error");
      return;
    }

    setLoading(true);
    const { error } = await createCompetition({
      bird_id: selectedBird,
      owner_id: user.id,
      name: name.trim(),
      location: location.trim() || null,
      date,
      rank,
      notes: notes.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast((error as any).message, "error");
    } else {
      toast("Résultat enregistré ✓");
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Nom du concours *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Concours régional 2025"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholderTextColor="#A08878"
          />
        </View>

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Lieu</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Fort-de-France"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholderTextColor="#A08878"
          />
        </View>

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Date *</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholderTextColor="#A08878"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-2">Classement *</Text>
          <View className="flex-row flex-wrap gap-2">
            {RANK_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setRankChoice(opt.value)}
                className={`px-3.5 py-2 rounded-full border ${rankChoice === opt.value ? "border-accent bg-accent-light" : "border-gray-200"}`}
              >
                <Text className={`text-sm ${rankChoice === opt.value ? "text-accent-dark font-medium" : "text-gray-600"}`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rankChoice === 0 && (
            <TextInput
              value={customRank}
              onChangeText={setCustomRank}
              placeholder="Ex: 5"
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm mt-2"
              placeholderTextColor="#A08878"
              keyboardType="number-pad"
            />
          )}
        </View>

        {birds.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs font-medium text-gray-600 mb-2">Oiseau *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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

        <View className="mb-4">
          <Text className="text-xs font-medium text-gray-600 mb-1.5">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Observations, conditions…"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholderTextColor="#A08878"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`rounded-xl py-3.5 items-center mt-2 ${loading ? "bg-accent/60" : "bg-accent"}`}
        >
          <Text className="text-white font-semibold">
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
