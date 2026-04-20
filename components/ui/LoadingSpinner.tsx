import { View, ActivityIndicator } from "react-native";

type Props = { full?: boolean };

export function LoadingSpinner({ full = false }: Props) {
  if (full) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#B85C38" />
      </View>
    );
  }
  return <ActivityIndicator size="small" color="#B85C38" />;
}
