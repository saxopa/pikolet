import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons size={24} name={name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1D9E75",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
          height: 80,
          paddingBottom: 16,
        },
        tabBarLabelStyle: { fontSize: 10 },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="voliere"
        options={{
          title: "Volière",
          tabBarIcon: ({ color }) => <TabIcon name="leaf-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chants"
        options={{
          title: "Chants",
          tabBarIcon: ({ color }) => <TabIcon name="musical-notes-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
