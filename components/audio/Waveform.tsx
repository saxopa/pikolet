import { View } from "react-native";

const HEIGHTS = [6,10,14,18,22,16,12,8,14,20,24,18,12,8,14,18,22,16,10,6,14,20,18,12,8,16,22,18,14,10];

type Props = { progress?: number };

export function Waveform({ progress = 0.4 }: Props) {
  const active = Math.floor(HEIGHTS.length * progress);
  return (
    <View className="flex-1 flex-row items-center gap-0.5 h-7">
      {HEIGHTS.map((h, i) => (
        <View
          key={i}
          style={{ height: h, width: 3, borderRadius: 2 }}
          className={i < active ? "bg-accent" : "bg-gray-200"}
        />
      ))}
    </View>
  );
}
