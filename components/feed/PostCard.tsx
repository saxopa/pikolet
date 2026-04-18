import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "../ui/Avatar";
import { AudioPlayer } from "../audio/AudioPlayer";
import type { FeedPost } from "../../hooks/useFeed";

type Props = {
  post: FeedPost;
  userId?: string;
  onLike: () => void;
  onComment: () => void;
};

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

export function PostCard({ post, userId, onLike, onComment }: Props) {
  const liked = post.post_likes.some(l => l.user_id === userId);
  const species = post.post_songs[0]?.song?.bird?.species;

  return (
    <View className="bg-white border border-gray-100 rounded-2xl mb-3 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center gap-2.5 px-3.5 pt-3 pb-2">
        <Avatar uri={post.author.avatar_url} name={post.author.display_name ?? post.author.username} size={36} />
        <View className="flex-1">
          <Text className="text-[13px] font-medium text-gray-900">
            {post.author.display_name ?? post.author.username}
          </Text>
          <Text className="text-[11px] text-gray-400">
            {timeAgo(post.created_at)}{post.author.location ? ` · ${post.author.location}` : ""}
          </Text>
        </View>
        {species && (
          <View className={`px-2.5 py-1 rounded-full ${species === "pikolet" ? "bg-accent-light" : "bg-blue-50"}`}>
            <Text className={`text-[11px] font-semibold ${species === "pikolet" ? "text-accent-dark" : "text-blue-700"}`}>
              {species === "pikolet" ? "Pikolèt" : "Lorti"}
            </Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View className="px-3.5 pb-3">
        {post.content && (
          <Text className="text-[13px] text-gray-600 leading-5 mb-2.5">{post.content}</Text>
        )}
        {post.post_songs.map(({ song }) => (
          <AudioPlayer
            key={song.id}
            url={song.storage_url}
            youtubeUrl={song.youtube_url}
            duration={song.duration_seconds}
            title={song.title}
          />
        ))}
      </View>

      {/* Actions */}
      <View className="flex-row gap-4 px-3.5 py-2.5 border-t border-gray-50">
        <TouchableOpacity onPress={onLike} className="flex-row items-center gap-1.5">
          <Text className={`text-base ${liked ? "text-red-500" : "text-gray-400"}`}>
            {liked ? "♥" : "♡"}
          </Text>
          <Text className="text-xs text-gray-500">{post.post_likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} className="flex-row items-center gap-1.5">
          <Text className="text-base text-gray-400">💬</Text>
          <Text className="text-xs text-gray-500">Commenter</Text>
        </TouchableOpacity>
        <View className="flex-1" />
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text className="text-xs text-gray-400">↗ Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
