import { View } from "react-native";
import { Skeleton } from "./Skeleton";

export function SkeletonPostCard() {
  return (
    <View style={{ backgroundColor: "white", borderColor: "#F3F4F6", borderWidth: 1, borderRadius: 16, marginBottom: 12, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Skeleton width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="55%" height={12} />
          <Skeleton width="35%" height={10} />
        </View>
      </View>
      <Skeleton height={12} />
      <Skeleton width="75%" height={12} />
      <Skeleton height={50} borderRadius={12} />
      <View style={{ flexDirection: "row", gap: 16, paddingTop: 4 }}>
        <Skeleton width={40} height={10} />
        <Skeleton width={60} height={10} />
      </View>
    </View>
  );
}
