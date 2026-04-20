import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect } from "react";
import { Avatar } from "../ui/Avatar";
import { getPostComments, addComment } from "../../lib/supabase";

type Comment = { id: string; content: string; created_at: string; author: { username: string; display_name: string | null; avatar_url: string | null } };

type Props = { postId: string; userId?: string; visible: boolean; onClose: () => void };

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function CommentsSheet({ postId, userId, visible, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    getPostComments(postId).then(({ data }) => { if (data) setComments(data as unknown as Comment[]); });
  }, [visible, postId]);

  async function send() {
    if (!text.trim() || !userId) return;
    setSending(true);
    await addComment(postId, userId, text.trim());
    setText("");
    const { data } = await getPostComments(postId);
    if (data) setComments(data as unknown as Comment[]);
    setSending(false);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
        {/* Handle */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-gray-200" />
        </View>
        <View className="flex-row items-center justify-between px-5 pb-3 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-900">Commentaires</Text>
          <TouchableOpacity onPress={onClose}><Text className="text-accent font-medium">Fermer</Text></TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          keyExtractor={c => c.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          ListEmptyComponent={<Text className="text-sm text-gray-400 text-center mt-8">Aucun commentaire — sois le premier 👋</Text>}
          renderItem={({ item }) => (
            <View className="flex-row gap-2.5">
              <Avatar uri={item.author.avatar_url} name={item.author.display_name ?? item.author.username} size={32} />
              <View className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[12px] font-semibold text-gray-900">{item.author.display_name ?? item.author.username}</Text>
                  <Text className="text-[11px] text-gray-400">{timeAgo(item.created_at)}</Text>
                </View>
                <Text className="text-sm text-gray-700 mt-0.5 leading-5">{item.content}</Text>
              </View>
            </View>
          )}
        />

        {userId && (
          <View className="flex-row items-center gap-2.5 px-4 py-3 border-t border-gray-100">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Ajoute un commentaire…"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm"
              placeholderTextColor="#A08878"
              returnKeyType="send"
              onSubmitEditing={send}
            />
            <TouchableOpacity onPress={send} disabled={sending || !text.trim()} className={`w-8 h-8 rounded-full items-center justify-center ${text.trim() ? "bg-accent" : "bg-gray-200"}`}>
              <Text className="text-white text-sm">↑</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
