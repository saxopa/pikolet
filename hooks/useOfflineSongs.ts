import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const STORAGE_KEY = "offline_songs_v1";
type OfflineMap = Record<string, string>; // songId → localUri

function localPath(songId: string) {
  return `${FileSystem.documentDirectory}songs/${songId}.mp3`;
}

export function useOfflineSongs() {
  const [downloaded, setDownloaded] = useState<OfflineMap>({});
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setDownloaded(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback(async (map: OfflineMap) => {
    setDownloaded(map);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, []);

  const download = useCallback(async (songId: string, remoteUrl: string) => {
    if (Platform.OS === "web" || !remoteUrl) return;
    if (downloaded[songId] || downloading.has(songId)) return;

    const dir = `${FileSystem.documentDirectory}songs/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

    const uri = localPath(songId);
    setDownloading(prev => new Set(prev).add(songId));
    try {
      await FileSystem.downloadAsync(remoteUrl, uri);
      await persist({ ...downloaded, [songId]: uri });
    } catch { /* download failed — user can retry */ } finally {
      setDownloading(prev => { const s = new Set(prev); s.delete(songId); return s; });
    }
  }, [downloaded, downloading, persist]);

  const remove = useCallback(async (songId: string) => {
    if (Platform.OS === "web") return;
    const uri = downloaded[songId];
    if (!uri) return;
    try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { /* ignore */ }
    const next = { ...downloaded };
    delete next[songId];
    await persist(next);
  }, [downloaded, persist]);

  const getLocalUri = useCallback((songId: string) => downloaded[songId] ?? null, [downloaded]);
  const isDownloaded = useCallback((songId: string) => !!downloaded[songId], [downloaded]);
  const isDownloading = useCallback((songId: string) => downloading.has(songId), [downloading]);

  return { download, remove, getLocalUri, isDownloaded, isDownloading };
}
