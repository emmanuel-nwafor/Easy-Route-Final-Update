import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from "../../data/AuthContext";
import { useRouter } from "expo-router";

export default function HomeHeader() {
    const { user, isDarkMode } = useAuth();
    const router = useRouter();

    return (
        <View>
            <View
                style={{ 
                    paddingTop: hp(7), 
                    paddingBottom: hp(2),
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9'
                }}
                className="px-6 flex-row justify-between items-center border-b"
            >
                <View className="flex-row items-center">
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={{ width: wp(10), height: wp(10) }}
                            className="rounded-full border border-slate-100"
                        />
                    ) : (
                        <View
                            style={{ width: wp(10), height: wp(10), backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
                            className="rounded-full items-center justify-center border border-slate-200"
                        >
                            <Ionicons name="person" size={wp(5.5)} color={isDarkMode ? '#CBD5E1' : '#94A3B8'} />
                        </View>
                    )}
                    <View className="ml-3">
                        <Text style={{ fontSize: wp(3) }} className="text-slate-400 font-[Outfit-Medium]">
                            Welcome back,
                        </Text>
                        <Text style={{ fontSize: wp(3.8), color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="font-[Outfit-Bold]">
                            {user?.name || 'User'}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                        onPress={() => router.push('/feature/profile/routes/NotificationsScreen')}
                        style={{ width: wp(10), height: wp(10), backgroundColor: isDarkMode ? '#334155' : '#F8FAFC' }}
                        className="rounded-full items-center justify-center border border-slate-100"
                    >
                        <Ionicons name="notifications-outline" size={wp(5)} color={isDarkMode ? '#F8FAFC' : '#1A1A1A'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}