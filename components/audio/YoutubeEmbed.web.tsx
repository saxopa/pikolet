import { View } from "react-native";

function extractVideoId(url: string): string | null {
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return watch[1];
  const shorts = url.match(/shorts\/([^?&/]+)/);
  if (shorts) return shorts[1];
  return null;
}

export function YoutubeEmbed({ url, isShort }: { url: string; isShort?: boolean }) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;

  return (
    <View
      style={{
        width: "100%",
        aspectRatio: isShort ? 9 / 16 : 16 / 9,
        maxHeight: isShort ? 320 : 200,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 8,
        backgroundColor: "#000",
      }}
    >
      {/* @ts-ignore */}
      <iframe
        src={embedUrl}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title="YouTube"
      />
    </View>
  );
}
