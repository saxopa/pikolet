import { useState, useEffect, useRef } from "react";
import { searchProfiles, getFollowStatus } from "../lib/supabase";

export type SearchProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  followStatus: "none" | "pending" | "accepted";
};

export function useUserSearch(query: string, currentUserId: string | undefined) {
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Nettoyage du debounce précédent
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // Si la requête est vide ou trop courte, on vide les résultats sans requête
    if (!trimmed || trimmed.length < 2 || !currentUserId) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error: searchError } = await searchProfiles(trimmed, currentUserId);

        if (!mountedRef.current) return;
        if (searchError) { setError("Erreur de recherche"); setLoading(false); return; }
        if (!data || data.length === 0) { setResults([]); setLoading(false); return; }

        // Enrichissement avec le statut de follow pour chaque profil
        const enriched: SearchProfile[] = await Promise.all(
          data.map(async (p) => {
            const { data: f } = await getFollowStatus(currentUserId, p.id);
            return {
              id: p.id,
              username: p.username,
              display_name: p.display_name ?? null,
              avatar_url: p.avatar_url ?? null,
              bio: p.bio ?? null,
              location: p.location ?? null,
              followStatus: f ? (f.status as "pending" | "accepted") : "none",
            };
          })
        );

        if (!mountedRef.current) return;
        setResults(enriched);
      } catch {
        if (mountedRef.current) setError("Erreur inattendue");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, currentUserId]);

  /**
   * Met à jour le follow status d'un profil localement
   * (évite de refetcher toute la liste après une action)
   */
  function updateFollowStatus(profileId: string, status: SearchProfile["followStatus"]) {
    setResults((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, followStatus: status } : p))
    );
  }

  return { results, loading, error, updateFollowStatus };
}
