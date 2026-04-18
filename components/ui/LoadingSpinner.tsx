import { View, ActivityIndicator } from "react-native";

type Props = { full?: boolean };

export function LoadingSpinner({ full = false }: Props) {
  if (full) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }
  return <ActivityIndicator size="small" color="#1D9E75" />;
}
