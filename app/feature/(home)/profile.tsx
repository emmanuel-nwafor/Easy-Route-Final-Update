import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Switch,
    Alert,
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { useRouter } from "expo-router";
import { useAuth } from "../shared/data/AuthContext";
import { PlansService } from "../shared/data/services/plans.service";
import * as Location from "expo-location";
import * as Haptics from 'expo-haptics';
import { APP_VARIANT } from "../shared/data/appConfig";
import { Colors } from "../../../constants/Color";
import LogoutConfirmationModal from "../shared/components/modals/LogoutConfirmationModal";

interface SettingsItemProps {
    icon: any;
    label: string;
    value?: string;
    isLast?: boolean;
    onPress?: () => void;
    showChevron?: boolean;
    iconColor?: string;
}

interface SettingsItemProps {
    icon: any;
    label: string;
    value?: string;
    isLast?: boolean;
    onPress?: () => void;
    showChevron?: boolean;
    iconColor?: string;
    isDarkMode?: boolean;
}

const SettingsItem = ({ icon, label, value, isLast, onPress, showChevron = true, iconColor = "#4DB6AC", isDarkMode }: SettingsItemProps) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center py-4"
        style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }}
    >
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }}>
            <Ionicons name={icon} size={20} color={isDarkMode ? '#4DB6AC' : '#003580'} />
        </View>
        <Text style={{ fontSize: wp(4), color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="flex-1 ml-4 font-[Outfit-Medium]">{label}</Text>
        {value && <Text style={{ fontSize: wp(3.5) }} className="mr-2 text-slate-400 font-[Outfit-Medium]">{value}</Text>}
        {showChevron && <Feather name="chevron-right" size={18} color={isDarkMode ? '#475569' : '#CBD5E1'} />}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const { user, logout, isDarkMode, setIsDarkMode } = useAuth();
    const router = useRouter();

    const [bookingCount, setBookingCount] = useState<number | null>(null);
    const [countryName, setCountryName] = useState<string | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const fadeInUp = (delay: number) => ({
        from: { opacity: 0, translateY: 20 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 800, delay } as const,
    });

    useEffect(() => {
        loadProfileStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadProfileStats().finally(() => setRefreshing(false));
    };

    const loadProfileStats = async () => {
        setStatsLoading(true);
        try {
            const bookings = await PlansService.getBookings();
            setBookingCount(Array.isArray(bookings) ? bookings.length : 0);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                const [geo] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (geo?.country) setCountryName(geo.country);
            }
        } catch (err) {
            console.warn('Profile stats load failed:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const triggerLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        router.replace('/feature/auth/screens/login');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: hp(12) }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDarkMode ? "#4DB6AC" : "#003580"}
                        colors={[isDarkMode ? "#4DB6AC" : "#003580"]}
                    />
                }
            >
                {/* Profile Header */}
                <View 
                    className="px-6 pt-16 pb-8 rounded-b-3xl border-b shadow-sm"
                    style={{ 
                        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                        borderColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                        shadowColor: isDarkMode ? '#000000' : '#E2E8F0'
                    }}
                >
                    <MotiView {...fadeInUp(100)} className="items-center">
                        <View className="relative">
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={{ width: wp(24), height: wp(24) }}
                                    className="rounded-full border-4 border-slate-100"
                                />
                            ) : (
                                <View
                                    style={{ width: wp(24), height: wp(24), borderColor: isDarkMode ? '#334155' : '#E2E8F0' }}
                                    className="rounded-full bg-slate-100 items-center justify-center border-4"
                                >
                                    <Ionicons name="person" size={wp(14)} color="#CBD5E1" />
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={() => router.push('/feature/profile/routes/PersonalInformation')}
                                className="absolute bottom-0 right-0 p-2 rounded-full border-2 border-white"
                                style={{ backgroundColor: isDarkMode ? '#4DB6AC' : '#003580' }}
                            >
                                <Feather name="edit-2" size={14} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: wp(6), color: isDarkMode ? Colors.dark.text : Colors.light.text }} className="font-[Outfit-Bold] mt-4">
                            {user?.name || 'Voyager'}
                        </Text>
                        <Text style={{ fontSize: wp(3.5), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium]">
                            {user?.email || 'voyager@example.com'}
                        </Text>
                        {user?.phone ? (
                            <Text style={{ fontSize: wp(3.5), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium] mt-1">
                                {user?.phone}
                            </Text>
                        ) : null}
                        {countryName ? (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="location-outline" size={14} color={isDarkMode ? '#4DB6AC' : '#94A3B8'} />
                                <Text style={{ fontSize: wp(3.2), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium] ml-1">
                                    {countryName}
                                </Text>
                            </View>
                        ) : null}
                    </MotiView>

                    {/* Real Stats Grid (Exposed only in Advanced UI) */}
                    {APP_VARIANT === 'advanced' && (
                        <MotiView
                            {...fadeInUp(200)}
                            className="flex-row justify-between mt-8 rounded-3xl p-5"
                            style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}
                        >
                            <View className="items-center flex-1">
                                {statsLoading ? (
                                    <ActivityIndicator size="small" color={isDarkMode ? '#4DB6AC' : '#003580'} />
                                ) : (
                                    <Text style={{ fontSize: wp(5), color: isDarkMode ? '#4DB6AC' : '#003580' }} className="font-[Outfit-Bold]">
                                        {bookingCount ?? 0}
                                    </Text>
                                )}
                                <Text style={{ fontSize: wp(3), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium]">Bookings</Text>
                            </View>
                            <View className="w-[1] h-full" style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }} />
                            <View className="items-center flex-1">
                                {statsLoading ? (
                                    <ActivityIndicator size="small" color={isDarkMode ? '#4DB6AC' : '#003580'} />
                                ) : (
                                    <Text style={{ fontSize: wp(5), color: isDarkMode ? '#4DB6AC' : '#003580' }} className="font-[Outfit-Bold]">
                                        {countryName ? '1' : '0'}
                                    </Text>
                                )}
                                <Text style={{ fontSize: wp(3), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium]">Countries</Text>
                            </View>
                            <View className="w-[1] h-full" style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }} />
                            <View className="items-center flex-1">
                                <Text style={{ fontSize: wp(5), color: isDarkMode ? '#4DB6AC' : '#003580' }} className="font-[Outfit-Bold]">
                                    {countryName || '—'}
                                </Text>
                                <Text style={{ fontSize: wp(3), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium]">Location</Text>
                            </View>
                        </MotiView>
                    )}
                </View>

                {/* Settings Section */}
                <View className="px-6 mt-6">
                    <MotiText
                        {...fadeInUp(300)}
                        style={{ fontSize: wp(4.5), color: isDarkMode ? Colors.dark.text : Colors.light.text }}
                        className="font-[Outfit-Bold] mb-4"
                    >
                        Account Settings
                    </MotiText>

                    <MotiView
                        {...fadeInUp(400)}
                        className="rounded-3xl px-4 border shadow-sm"
                        style={{ 
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
                            borderColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                            shadowColor: isDarkMode ? '#000000' : '#E2E8F0'
                        }}
                    >
                        <SettingsItem
                            icon="person-outline"
                            label="Personal Information"
                            isDarkMode={isDarkMode}
                            onPress={() => router.push('/feature/profile/routes/PersonalInformation')}
                        />

                        <SettingsItem
                            icon="notifications-outline"
                            label="Notifications"
                            isDarkMode={isDarkMode}
                            onPress={() => router.push('/feature/profile/routes/NotificationsScreen')}
                        />

                        <SettingsItem
                            icon="information-circle-outline"
                            label="About EasyRoute"
                            isLast={true}
                            isDarkMode={isDarkMode}
                            onPress={() => router.push('/feature/profile/routes/AboutScreen')}
                        />

                        <SettingsItem 
                            icon="settings-outline"
                            label="Settings"
                            isDarkMode={isDarkMode}
                            onPress={() => router.push('/feature/profile/routes/PrivacySecurity')}
                        />
                    </MotiView>

                    {/* Logout Button */}
                    <MotiView {...fadeInUp(500)}>
                        <TouchableOpacity
                            onPress={handleLogout}
                            activeOpacity={0.8}
                            className="mt-8 flex-row items-center justify-center bg-red-50 py-4 rounded-2xl border border-red-100"
                        >
                            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                            <Text style={{ fontSize: wp(4) }} className="ml-2 font-[Outfit-Bold] text-red-500">Log Out</Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: wp(3) }} className="text-center text-slate-400 font-[Outfit-Medium] mt-6">
                            Version 1.0.4 - EasyRoute {APP_VARIANT === 'advanced' ? 'Advanced' : 'Simple'} UI
                        </Text>
                    </MotiView>
                </View>
            </ScrollView>
            <LogoutConfirmationModal
                visible={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={triggerLogout}
            />
        </View>
    );
}