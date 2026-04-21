import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalAudio } from "../../context/GlobalAudioContext";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

export function FloatingAudioPlayer() {
  const { state, pause, resume, close } = useGlobalAudio();

  if (!state.currentTrack) return null;

  return (
    <Animated.View 
      entering={FadeInDown.springify().damping(20).stiffness(200)} 
      exiting={FadeOutDown}
      className="absolute bottom-[90px] left-4 right-4 bg-[#1C1C1E]/95 rounded-2xl flex-row items-center px-4 py-3 z-50 shadow-xl"
      style={{
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 10,
      }}
    >
      <View className="flex-1 mr-3">
        <Text className="text-white font-bold text-[13px] mb-1" numberOfLines={1}>
          {state.currentTrack.title}
        </Text>
        <View className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <View 
            className="h-full bg-accent rounded-full" 
            style={{ width: `${Math.max(0, state.progress * 100)}%` }} 
          />
        </View>
      </View>
      
      <View className="flex-row items-center gap-4">
        {state.isLoading ? (
          <View className="w-9 h-9 items-center justify-center">
             <Text className="text-white text-xs opacity-70">...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={state.isPlaying ? pause : resume}
            className="w-9 h-9 bg-accent rounded-full items-center justify-center shadow-md bg-[#B85C38]"
          >
            <Ionicons name={state.isPlaying ? "pause" : "play"} size={16} color="white" style={{ marginLeft: state.isPlaying ? 0 : 2 }} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={close} className="w-8 h-8 items-center justify-center bg-white/10 rounded-full">
           <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
