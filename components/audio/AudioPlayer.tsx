import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Waveform } from "./Waveform";

type Props = {
  url?: string | null;
  youtubeUrl?: string | null;
  duration?: number | null;
  title?: string;
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ url, youtubeUrl, duration, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // expo-av chargé dynamiquement — non disponible sur web
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sound = useRef<any>(null);

  useEffect(() => () => { sound.current?.unloadAsync(); }, []);

  async function toggle() {
    if (youtubeUrl || Platform.OS === "web") {
      if (youtubeUrl) Linking.openURL(youtubeUrl);
      return;
    }
    if (!url) return;
    if (!sound.current) {
      const { Audio } = await import("expo-av");
      const { sound: s } = await Audio.Sound.createAsync({ uri: url }, {}, (status) => {
        if (status.isLoaded && status.durationMillis) {
          setProgress(status.positionMillis / status.durationMillis);
          if (status.didJustFinish) { setPlaying(false); setProgress(0); }
        }
      });
      sound.current = s;
    }
    if (playing) { await sound.current?.pauseAsync(); setPlaying(false); }
    else { await sound.current?.playAsync(); setPlaying(true); }
  }

  const isYt = !!youtubeUrl || Platform.OS === "web";

  return (
    <View className="bg-gray-50 rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 mb-2">
      <TouchableOpacity
        onPress={toggle}
        className="w-8 h-8 rounded-full bg-accent items-center justify-center"
        activeOpacity={0.8}
      >
        {isYt
          ? <Ionicons name="logo-youtube" size={14} color="white" />
          : <Ionicons name={playing ? "pause" : "play"} size={14} color="white" style={{ marginLeft: playing ? 0 : 2 }} />
        }
      </TouchableOpacity>

      {isYt ? (
        <Text className="flex-1 text-xs text-gray-600" numberOfLines={1}>
          {title ?? "Écouter sur YouTube"}
        </Text>
      ) : (
        <Waveform progress={progress} />
      )}

      {duration && (
        <Text className="text-[11px] text-gray-400">{formatDuration(duration)}</Text>
      )}
    </View>
  );
}
