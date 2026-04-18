import { View, Text } from "react-native";

type Variant = "green" | "amber" | "blue" | "gray";

const styles: Record<Variant, string> = {
  green: "bg-accent-light",
  amber:  "bg-amber-50",
  blue:   "bg-blue-50",
  gray:   "bg-gray-100",
};
const textStyles: Record<Variant, string> = {
  green: "text-accent-dark",
  amber:  "text-amber-700",
  blue:   "text-blue-700",
  gray:   "text-gray-500",
};

type Props = { label: string; variant?: Variant };

export function Badge({ label, variant = "gray" }: Props) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${styles[variant]}`}>
      <Text className={`text-[10px] font-semibold ${textStyles[variant]}`}>{label}</Text>
    </View>
  );
}
