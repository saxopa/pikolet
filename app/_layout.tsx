import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = { initialRouteName: "(tabs)" };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerTintColor: "#1D9E75", headerShadowVisible: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ title: "Connexion", headerBackTitle: "" }} />
      <Stack.Screen name="auth/register" options={{ title: "Créer un compte", headerBackTitle: "" }} />
      <Stack.Screen name="auth/edit-profile" options={{ title: "Mon profil", headerBackTitle: "" }} />
      <Stack.Screen name="bird/[id]" options={{ title: "", headerBackTitle: "Volière" }} />
      <Stack.Screen name="bird/new" options={{ title: "Nouvel oiseau", headerBackTitle: "" }} />
      <Stack.Screen name="bird/[id]/log" options={{ title: "Journal", headerBackTitle: "" }} />
      <Stack.Screen name="post/new" options={{ title: "Nouveau post", headerBackTitle: "" }} />
    </Stack>
  );
}
