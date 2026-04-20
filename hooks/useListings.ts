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

  const load = useCallback(async (cat = category) => {
    setLoading(true);
    const { data } = await getListings(cat);
    if (data) setListings(data as unknown as ListingWithSeller[]);
    setLoading(false);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const changeCategory = useCallback((cat: string) => {
    setCategory(cat);
    load(cat);
  }, [load]);

  return { listings, category, changeCategory, loading, refresh: load };
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
