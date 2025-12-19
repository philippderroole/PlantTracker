import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="plants"
                options={{
                    title: "Plants",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="0.circle" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="wifi"
                options={{
                    title: "Wi-Fi",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="wifi" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
