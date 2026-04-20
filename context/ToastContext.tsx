import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { Animated, Text, Platform, View } from "react-native";

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>("success");
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string, t: ToastType = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    setType(t);
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => setMessage(null));
  }, [opacity]);

  const bg = type === "error" ? "#EF4444" : type === "info" ? "#3B82F6" : "#B85C38";

  return (
    <ToastContext.Provider value={{ toast }}>
      <View style={{ flex: 1 }}>
        {children}
        {message && (
          <Animated.View
            pointerEvents="none"
            style={{
              opacity,
              position: "absolute",
              top: Platform.OS === "ios" ? 56 : 32,
              left: 16, right: 16, zIndex: 9999,
              backgroundColor: bg, borderRadius: 14,
              paddingHorizontal: 16, paddingVertical: 13,
              shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.18, shadowRadius: 10, elevation: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600", lineHeight: 20 }}>{message}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
