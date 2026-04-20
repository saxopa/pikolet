import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "../ui/Avatar";
import type { ConversationWithParticipants } from "../../hooks/useConversations";

type Participant = { id: string; username: string; display_name: string | null; avatar_url: string | null };

type Props = {
  conversation: ConversationWithParticipants;
  other: Participant;
  userId: string;
  onPress: () => void;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ConversationItem({ conversation, other, onPress }: Props) {
  const preview = conversation.last_message_preview;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-100"
    >
      <Avatar uri={other.avatar_url} name={other.display_name ?? other.username} size={48} />
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
            {other.display_name ?? other.username}
          </Text>
          <Text className="text-[11px] text-gray-400 shrink-0">
            {timeAgo(conversation.last_message_at)}
          </Text>
        </View>
        <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
          {preview ?? "Nouvelle conversation"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
