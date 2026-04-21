// Fallback natif : pas de WebView installé → null (AudioPlayer ouvre YouTube)
export function YoutubeEmbed(_props: { url: string; isShort?: boolean }) {
  return null;
}
