import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = { width?: number | string; height?: number; borderRadius?: number };

export function Skeleton({ width = "100%", height = 14, borderRadius = 8 }: Props) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.View style={{ backgroundColor: "#E5E7EB", borderRadius, width: width as never, height, opacity }} />
  );
}
