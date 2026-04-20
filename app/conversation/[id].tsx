import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useMessages } from "../../hooks/useMessages";
import type { Message } from "../../types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

type Props = {
  messages: Message[];
  userId: string;
};

function groupByDay(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let current: { date: string; messages: Message[] } | null = null;
  for (const m of messages) {
    const date = formatDate(m.created_at);
    if (!current || current.date !== date) {
      current = { date, messages: [m] };
      groups.push(current);
    } else {
      current.messages.push(m);
    }
  }
  return groups;
}

export default function ConversationScreen() {
  const { id, username, display } = useLocalSearchParams<{ id: string; username: string; display: string }>();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { messages, loading, sending, send } = useMessages(id, user?.id);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: display ?? username ?? "Conversation" });
  }, [display, username, navigation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  async function handleSend() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    await send(content);
  }

  const groups = groupByDay(messages);

  const renderItem = ({ item: group }: { item: { date: string; messages: Message[] } }) => (
    <View>
      <View className="items-center my-3">
        <View className="bg-gray-200 px-3 py-1 rounded-full">
          <Text className="text-[11px] text-gray-500">{group.date}</Text>
        </View>
      </View>
      {group.messages.map(msg => {
        const isMine = msg.sender_id === user?.id;
        const isOptimistic = msg.id.startsWith("optimistic-");
        return (
          <View key={msg.id} className={`flex-row mb-1 px-4 ${isMine ? "justify-end" : "justify-start"}`}>
            <View
              className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl ${
                isMine
                  ? "bg-accent rounded-tr-sm"
                  : "bg-white rounded-tl-sm"
              }`}
              style={isMine ? {} : {
                shadowColor: "#1C1209",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <Text className={`text-sm leading-[19px] ${isMine ? "text-white" : "text-gray-900"}`}>
                {msg.content}
              </Text>
              <Text className={`text-[10px] mt-1 text-right ${isMine ? "text-white/60" : "text-gray-400"}`}>
                {formatTime(msg.created_at)}{isOptimistic ? " ·· " : ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      className="flex-1 bg-gray-50"
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Chargement…</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={groups}
          keyExtractor={g => g.date}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-3xl mb-2">👋</Text>
              <Text className="text-sm text-gray-400">Dis bonjour !</Text>
            </View>
          }
        />
      )}

      {/* Barre de saisie */}
      <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-100">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message…"
          placeholderTextColor="#A08878"
          multiline
          maxLength={2000}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-900 max-h-28"
          onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || sending}
          className={`w-10 h-10 rounded-full items-center justify-center ${input.trim() && !sending ? "bg-accent" : "bg-gray-200"}`}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color={input.trim() && !sending ? "white" : "#A08878"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
