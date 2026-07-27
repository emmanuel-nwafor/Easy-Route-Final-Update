import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useAuth } from "../shared/data/AuthContext";
import { APP_VARIANT } from "../shared/data/appConfig";

const TabIcon = ({
    name,
    focused,
    color,
}: {
    name: any;
    focused: boolean;
    color: string;
}) => {
    return (
        <View style={styles.container}>
            <Ionicons
                name={name}
                size={24}
                color={color}
            />
        </View>
    );
};

export default function UsersLayout() {
    const { isDarkMode } = useAuth();

    const activeColor = isDarkMode ? "#38BDF8" : "#003580";
    const inactiveColor = isDarkMode ? "#64748B" : "#94A3B8";
    const bgColor = isDarkMode ? "#0F172A" : "#FFFFFF";
    const borderColor = isDarkMode ? "#1E293B" : "#F1F5F9";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: bgColor,
                    borderTopWidth: 1,
                    borderTopColor: borderColor,
                    height: Platform.OS === "ios" ? 100 : 105,
                    paddingBottom: Platform.OS === "ios" ? 30 : 10,
                    paddingTop: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: isDarkMode ? 0.2 : 0.05,
                    shadowRadius: 3,
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontFamily: "Outfit-Medium",
                    fontSize: 11,
                    marginTop: 0,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name={focused ? "home" : "home-outline"}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="plan"
                options={{
                    title: "Plan",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name={focused ? "add-circle" : "add-circle-outline"}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="chatbot"
                options={{
                    title: "Chat",
                    href: APP_VARIANT === "advanced" ? undefined : null,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: "Bookings",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name={focused ? "calendar" : "calendar-outline"}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name={focused ? "person" : "person-outline"}
                            focused={focused}
                            color={focused ? activeColor : inactiveColor}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
});