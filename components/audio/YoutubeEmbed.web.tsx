import { useRef, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function extractVideoId(url: string): string | null {
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return watch[1];
  const shorts = url.match(/shorts\/([^?&/]+)/);
  if (shorts) return shorts[1];
  return null;
}

function buildSrc(videoId: string, loop: boolean) {
  const params = [
    "autoplay=1",
    "rel=0",
    "modestbranding=1",
    "playsinline=1",
    loop ? `loop=1&playlist=${videoId}` : "",
  ].filter(Boolean).join("&");
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

export function YoutubeEmbed({ url, isShort }: { url: string; isShort?: boolean }) {
  const [started, setStarted] = useState(false);
  const [loop, setLoop] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoId = extractVideoId(url);

  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const playerHeight = isShort ? 280 : 120;

  function toggleLoop() {
    const next = !loop;
    setLoop(next);
    if (iframeRef.current && started) {
      iframeRef.current.src = buildSrc(videoId!, next);
    }
  }

  return (
    <View style={{ marginTop: 8 }}>
      {/* ── Zone player ─────────────────────────────── */}
      <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>

        {!started ? (
          /* ── Thumbnail + bouton play ── */
          <TouchableOpacity
            onPress={() => setStarted(true)}
            activeOpacity={0.85}
            style={{ position: "relative" }}
          >
            {/* @ts-ignore */}
            <img
              src={thumbnail}
              style={{
                width: "100%",
                height: playerHeight,
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Overlay sombre */}
            <View style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.28)",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: "rgba(184,92,56,0.92)",
                alignItems: "center", justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.35,
                shadowRadius: 6,
              }}>
                <Ionicons name="play" size={24} color="white" style={{ marginLeft: 3 }} />
              </View>
            </View>
          </TouchableOpacity>

        ) : (
          /* ── Iframe compact ── */
          // @ts-ignore
          <iframe
            ref={iframeRef}
            src={buildSrc(videoId, loop)}
            style={{
              width: "100%",
              height: playerHeight,
              border: "none",
              display: "block",
            }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title="YouTube"
          />
        )}
      </View>

      {/* ── Barre de contrôles custom ────────────────── */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingTop: 6,
        paddingHorizontal: 2,
        gap: 8,
      }}>
        <TouchableOpacity
          onPress={toggleLoop}
          activeOpacity={0.75}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: loop ? "#FFF0E8" : "#f3f4f6",
          }}
        >
          <Ionicons
            name="repeat"
            size={14}
            color={loop ? "#B85C38" : "#9ca3af"}
          />
          <Text style={{
            fontSize: 11,
            color: loop ? "#B85C38" : "#9ca3af",
            fontWeight: loop ? "700" : "400",
          }}>
            Boucle
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
