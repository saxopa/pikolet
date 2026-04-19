import { View } from "react-native";
import { Skeleton } from "./Skeleton";

export function SkeletonBirdCard() {
  return (
    <View style={{ flex: 1, backgroundColor: "white", borderColor: "#F3F4F6", borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 }}>
      <Skeleton width={44} height={44} borderRadius={12} />
      <Skeleton width="70%" height={12} />
      <Skeleton width="55%" height={10} />
      <Skeleton width={60} height={18} borderRadius={10} />
    </View>
  );
}
