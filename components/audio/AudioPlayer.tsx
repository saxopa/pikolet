import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Waveform } from "./Waveform";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  url?: string | null;
  youtubeUrl?: string | null;
  duration?: number | null;
  title?: string;
  localUri?: string | null;
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function GuestModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <View style={{
            backgroundColor: "white",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 28,
            paddingBottom: Platform.OS === "ios" ? 44 : 28,
            alignItems: "center",
            gap: 8,
          }}>
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: "#FFF0E8",
              alignItems: "center", justifyContent: "center",
              marginBottom: 4,
            }}>
              <Ionicons name="musical-notes" size={26} color="#B85C38" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a", textAlign: "center" }}>
              Écoute les chants
            </Text>
            <Text style={{ fontSize: 13, color: "#7A6456", textAlign: "center", lineHeight: 20, marginBottom: 8 }}>
              Connecte-toi pour écouter les enregistrements de la communauté et accéder à la bibliothèque complète.
            </Text>
            <TouchableOpacity
              onPress={() => { onClose(); router.push("/auth/login"); }}
              style={{
                backgroundColor: "#B85C38", borderRadius: 14,
                paddingVertical: 14, width: "100%", alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onClose(); router.push("/auth/register"); }}
              style={{
                borderWidth: 1.5, borderColor: "#B85C38", borderRadius: 14,
                paddingVertical: 12, width: "100%", alignItems: "center",
              }}
            >
              <Text style={{ color: "#B85C38", fontWeight: "600", fontSize: 14 }}>Créer un compte gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 8 }}>
              <Text style={{ color: "#C8B49E", fontSize: 13 }}>Continuer sans compte</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export function AudioPlayer({ url, youtubeUrl, duration, title, localUri }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sound = useRef<any>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => () => {
    if (Platform.OS === "web") {
      if (sound.current) { sound.current.pause(); sound.current.src = ""; }
    } else {
      sound.current?.unloadAsync();
    }
  }, []);

  async function toggle() {
    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }

    if (youtubeUrl) {
      const { Linking } = await import("react-native");
      Linking.openURL(youtubeUrl);
      return;
    }

    const playUri = localUri ?? url;
    if (!playUri) return;

    if (Platform.OS === "web") {
      if (!sound.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audio = new (window as any).Audio(playUri) as HTMLAudioElement;
        audio.addEventListener("ended", () => { setPlaying(false); setProgress(0); });
        audio.addEventListener("timeupdate", () => {
          if (audio.duration) setProgress(audio.currentTime / audio.duration);
        });
        sound.current = audio;
      }
      if (playing) {
        sound.current.pause();
        setPlaying(false);
      } else {
        await sound.current.play();
        setPlaying(true);
      }
      return;
    }

    if (!sound.current) {
      const { Audio } = await import("expo-av");
      const { sound: s } = await Audio.Sound.createAsync({ uri: playUri }, {}, (status) => {
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

  const isYt = !!youtubeUrl;
  const hasAudio = isYt || !!url || !!localUri;
  if (!hasAudio) return null;

  return (
    <>
      <GuestModal visible={showGuestModal} onClose={() => setShowGuestModal(false)} />
      <View className="bg-gray-50 rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 mb-2">
        <TouchableOpacity
          onPress={toggle}
          className="w-8 h-8 rounded-full bg-accent items-center justify-center"
          activeOpacity={0.8}
        >
          {!isAuthenticated ? (
            <Ionicons name="lock-closed" size={13} color="white" />
          ) : isYt ? (
            <Ionicons name="logo-youtube" size={14} color="white" />
          ) : (
            <Ionicons name={playing ? "pause" : "play"} size={14} color="white" style={{ marginLeft: playing ? 0 : 2 }} />
          )}
        </TouchableOpacity>

        {isYt ? (
          <Text className="flex-1 text-xs text-gray-600" numberOfLines={1}>
            {title ?? "Écouter sur YouTube"}
          </Text>
        ) : (
          <View className="flex-1">
            <Waveform progress={isAuthenticated ? progress : 0} />
            {!isAuthenticated && (
              <Text className="text-[10px] text-accent/70 mt-0.5">
                Connecte-toi pour écouter
              </Text>
            )}
          </View>
        )}

        {duration && (
          <Text className="text-[11px] text-gray-400">{formatDuration(duration)}</Text>
        )}
      </View>
    </>
  );
}
