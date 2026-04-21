import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";

type PlayerState = {
  isPlaying: boolean;
  progress: number; // 0 to 1
  duration: number | null;
  currentTrack: TrackInfo | null;
  isLoading: boolean;
};

type TrackInfo = {
  id: string;
  url: string;
  title: string;
  youtubeUrl?: string | null;
};

type GlobalAudioContextType = {
  state: PlayerState;
  playTrack: (track: TrackInfo) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  close: () => Promise<void>;
};

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    progress: 0,
    duration: null,
    currentTrack: null,
    isLoading: false,
  });
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = "";
      } else if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const close = async () => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.pause();
    } else if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    setState(s => ({ ...s, isPlaying: false, progress: 0, currentTrack: null }));
  };

  const playTrack = async (track: TrackInfo) => {
    if (state.currentTrack?.id === track.id) {
       if (state.isPlaying) {
         await pause();
       } else {
         await resume();
       }
       return;
    }

    await close();
    setState(s => ({ ...s, isLoading: true, currentTrack: track }));

    if (Platform.OS === 'web') {
      const audio = new window.Audio(track.url);
      audio.addEventListener("ended", () => setState(s => ({ ...s, isPlaying: false, progress: 0 })));
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          setState(s => ({ ...s, progress: audio.currentTime / audio.duration, duration: audio.duration }));
        }
      });
      webAudioRef.current = audio;
      await audio.play();
      setState(s => ({ ...s, isLoading: false, isPlaying: true }));
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setState(s => ({
              ...s, 
              isPlaying: status.isPlaying,
              progress: status.durationMillis ? status.positionMillis / status.durationMillis : 0,
              duration: status.durationMillis ? status.durationMillis / 1000 : null
            }));
            if (status.didJustFinish) {
               setState(s => ({ ...s, isPlaying: false, progress: 0 }));
            }
          }
        }
      );
      soundRef.current = sound;
      setState(s => ({ ...s, isLoading: false, isPlaying: true }));
    } catch(e) {
      console.error(e);
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const pause = async () => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.pause();
    } else if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
    setState(s => ({ ...s, isPlaying: false }));
  };

  const resume = async () => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      await webAudioRef.current.play();
    } else if (soundRef.current) {
      await soundRef.current.playAsync();
    }
    setState(s => ({ ...s, isPlaying: true }));
  };

  return (
    <GlobalAudioContext.Provider value={{ state, playTrack, pause, resume, close }}>
      {children}
    </GlobalAudioContext.Provider>
  );
}

export const useGlobalAudio = () => {
  const ctx = useContext(GlobalAudioContext);
  if (!ctx) throw new Error("useGlobalAudio must be used inside GlobalAudioProvider");
  return ctx;
};
