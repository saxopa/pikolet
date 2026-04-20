import { View, Text, Image } from "react-native";

type Props = { uri?: string | null; name?: string | null; size?: number };

export function Avatar({ uri, name, size = 36 }: Props) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={style} className="bg-gray-100" />;
  }

  return (
    <View style={style} className="bg-forest-light items-center justify-center">
      <Text className="text-forest-dark font-semibold" style={{ fontSize: size * 0.35 }}>
        {initials}
      </Text>
    </View>
  );
}
