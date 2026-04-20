import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name, activeIcon, color, focused,
}: { name: IconName; activeIcon: IconName; color: string; focused: boolean }) {
  return <Ionicons size={24} name={focused ? activeIcon : name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#B85C38",
        tabBarInactiveTintColor: "#A08878",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          shadowColor: "#1C1209",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" activeIcon="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="voliere"
        options={{
          title: "Volière",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf-outline" activeIcon="leaf" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chants"
        options={{
          title: "Chants",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="musical-notes-outline" activeIcon="musical-notes" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubbles-outline" activeIcon="chatbubbles" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="marche"
        options={{
          title: "Marché",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="storefront-outline" activeIcon="storefront" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" activeIcon="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
