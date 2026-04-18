import { View, Text } from "react-native";

type Props = { icon: string; title: string; subtitle?: string };

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-base font-medium text-gray-700">{title}</Text>
      {subtitle && <Text className="text-sm text-gray-400 mt-1 text-center px-8">{subtitle}</Text>}
    </View>
  );
}
