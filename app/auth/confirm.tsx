import { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

/**
 * Écran de confirmation email.
 *
 * Flux : l'utilisateur clique sur le lien dans l'email de confirmation,
 * son navigateur ouvre https://saxopa.github.io/pikolet/auth/confirm
 * avec un fragment hash : #access_token=...&refresh_token=...&type=signup
 *
 * Sur WEB : le SDK Supabase JS détecte automatiquement ce hash via
 * onAuthStateChange et appelle setSession. On attend la session puis
 * on redirige vers le feed.
 *
 * Sur NATIF (Expo Go / build) : les params arrivent en query params
 * via le deep link, on appelle setSession manuellement.
 */
export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    type?: string;
    error?: string;
    error_description?: string;
  }>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function handleConfirm() {
      // ── Cas d'erreur renvoyé par Supabase ────────────────────────────
      if (params.error) {
        router.replace({
          pathname: "/auth/login",
          params: { confirm_error: params.error_description ?? params.error },
        });
        return;
      }

      // ── Contexte NATIF : tokens dans les query params ─────────────────
      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error) {
          router.replace({
            pathname: "/auth/login",
            params: { confirm_error: "Lien expiré. Reconnecte-toi." },
          });
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
          if (!profile?.username) {
            router.replace("/auth/setup-username");
            return;
          }
        }
        router.replace("/(tabs)/feed");
        return;
      }

      // ── Contexte WEB : le SDK Supabase lit le hash automatiquement ────
      // On attend jusqu'à 8 secondes que onAuthStateChange déclenche SIGNED_IN
      if (Platform.OS === "web") {
        const timeout = setTimeout(() => {
          // Délai dépassé sans session → lien probablement expiré
          router.replace({
            pathname: "/auth/login",
            params: { confirm_error: "Le lien a expiré. Réessaie de te connecter." },
          });
        }, 8000);

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            clearTimeout(timeout);
            listener.subscription.unsubscribe();
            const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).single();
            if (!profile?.username) {
              router.replace("/auth/setup-username");
            } else {
              router.replace("/(tabs)/feed");
            }
          }
          if (event === "PASSWORD_RECOVERY") {
            clearTimeout(timeout);
            listener.subscription.unsubscribe();
            router.replace("/auth/reset-password");
          }
        });

        return () => {
          clearTimeout(timeout);
          listener.subscription.unsubscribe();
        };
      }

      // Fallback : aucun token et pas sur web → retour login
      router.replace("/auth/login");
    }

    handleConfirm();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-accent-light gap-4">
      <ActivityIndicator size="large" color="#B85C38" />
      <Text className="text-accent font-semibold text-base">Confirmation en cours…</Text>
      <Text className="text-xs text-accent/60 text-center px-8">
        Merci de patienter, tu vas être redirigé automatiquement.
      </Text>
    </View>
  );
}
