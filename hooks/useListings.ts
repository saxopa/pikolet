import { useState, useEffect, useCallback } from "react";
import { getListings, getMyListings } from "../lib/supabase";
import type { Listing } from "../types";

type ListingWithSeller = Listing & {
  seller: { id: string; username: string; display_name: string | null; location: string | null };
};

export function useListings() {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    setError(false);
    const { data, error: err } = await getListings(cat);
    if (err) setError(true);
    else if (data) setListings(data as unknown as ListingWithSeller[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(category); }, [load, category]);

  const changeCategory = useCallback((cat: string) => {
    setCategory(cat);
  }, []);

  const refresh = useCallback(() => load(category), [load, category]);

  return { listings, category, changeCategory, loading, error, refresh };
}

export function useMyListings(sellerId?: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    const { data } = await getMyListings(sellerId);
    if (data) setListings(data as Listing[]);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { load(); }, [load]);

  return { listings, loading, refresh: load };
}
