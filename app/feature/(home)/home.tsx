import React, { useState, useCallback } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    RefreshControl,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

import HomeHeader from "@/app/feature/shared/components/headers/HomeHeader";
import { PlansService } from "../shared/data/services/plans.service";
import { useAuth } from "../shared/data/AuthContext";
import { APP_VARIANT } from "../shared/data/appConfig";
import PlanYourJourneyCard from "../shared/components/cards/PlanYourJourneyCard";

export default function HomeScreen() {
    const { user, isDarkMode } = useAuth();
    const router = useRouter();
    const [recentTrip, setRecentTrip] = useState<any>(null);
    const [upcomingTrip, setUpcomingTrip] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);
    
    // Quick statistics dashboard counters
    const [stats, setStats] = useState({ active: 0, saved: 0 });

    const fadeInDown = (delay: number) => ({
        from: { opacity: 0, translateY: -15 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 600, delay } as const,
    });

    const fadeInUp = (delay: number) => ({
        from: { opacity: 0, translateY: 15 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 600, delay } as const,
    });

    // Auto-fetch on focus
    useFocusEffect(
        useCallback(() => {
            fetchTrips();
            SecureStore.getItemAsync('recentSearches').then(val => {
                if (val) {
                    const parsed = JSON.parse(val);
                    setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, 4) : []);
                } else {
                    setRecentSearches([]);
                }
            });
        }, [])
    );

    const fetchTrips = async () => {
        try {
            const [plans, bookings] = await Promise.all([
                PlansService.getUserPlans(),
                PlansService.getBookings()
            ]);

            const allTrips = [...plans, ...bookings].sort((a, b) =>
                new Date(b.startDate || b.bookingDate || b.createdAt).getTime() -
                new Date(a.startDate || a.bookingDate || a.createdAt).getTime()
            );

            const now = new Date();
            const recent = allTrips.find(t => new Date(t.startDate || t.bookingDate || t.createdAt) < now);
            setRecentTrip(recent);

            const coming = allTrips.find(t => new Date(t.startDate || t.bookingDate || t.createdAt) >= now);
            setUpcomingTrip(coming);

            setStats({
                active: allTrips.filter(t => new Date(t.startDate || t.bookingDate || t.createdAt) >= now).length,
                saved: bookings.length
            });
        } catch (error) {
            console.error("Failed to fetch trips for Home:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrips();
    };

    const handleSearchClick = (search: typeof recentSearches[0]) => {
        router.push({
            pathname: '/feature/search/screens/all-search',
            params: { from: search.from, to: search.to, date: search.date }
        });
    };

    // Dark Mode Theme Variables
    const bgColor = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const primaryText = isDarkMode ? '#F8FAFC' : '#0F172A';
    const secondaryText = isDarkMode ? '#94A3B8' : '#64748B';

    return (
        <View className="flex-1" style={{ backgroundColor: bgColor }}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={bgColor} 
                translucent={false} 
            />
            
            <MotiView {...fadeInDown(0)}>
                <HomeHeader />
            </MotiView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: hp(6) }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDarkMode ? "#38BDF8" : "#003580"}
                        colors={[isDarkMode ? "#38BDF8" : "#003580"]}
                    />
                }
            >
                {/* Greeting Header */}
                <View className="mb-3">
                    <MotiText
                        {...fadeInUp(100)}
                        style={{ fontSize: wp(6.2), color: primaryText }}
                        className="font-[Outfit-Bold] tracking-tight"
                    >
                        Discover your next route
                    </MotiText>
                    <MotiText
                        {...fadeInUp(150)}
                        style={{ fontSize: wp(3.4), color: secondaryText }}
                        className="font-[Outfit-Medium] mt-1"
                    >
                        Your journey management center
                    </MotiText>
                </View>

                {/* Plan Journey Card (Simple UI only) */}
                {APP_VARIANT !== 'advanced' && (
                    <MotiView {...fadeInUp(200)} className="mb-6">
                        <PlanYourJourneyCard />
                    </MotiView>
                )}

                {/* Dashboard Grid System (Advanced UI only) */}
                {APP_VARIANT === 'advanced' && (
                    <MotiView {...fadeInUp(200)} className="flex-row flex-wrap justify-between mb-6">
                        {/* Search Journey Card */}
                        <TouchableOpacity
                            onPress={() => router.push("/feature/(home)/plan")}
                            activeOpacity={0.8}
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                            className="p-4 rounded-2xl border w-[48%] mb-4"
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View style={{ backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF' }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Ionicons name="search" size={18} color={isDarkMode ? "#38BDF8" : "#003580"} />
                                </View>
                                <View style={{ backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF' }} className="px-2 py-1 rounded-md">
                                    <Text style={{ color: isDarkMode ? '#38BDF8' : '#003580', fontSize: wp(2.5) }} className="font-[Outfit-Bold]">GO</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: wp(3.6), color: primaryText }} className="font-[Outfit-Bold]">Search</Text>
                            <Text style={{ fontSize: wp(2.8), color: secondaryText }} className="font-[Outfit-Medium] mt-0.5">Plan a new route</Text>
                        </TouchableOpacity>

                        {/* Saved Journeys Card */}
                        <TouchableOpacity
                            onPress={() => router.push("/feature/(home)/bookings")}
                            activeOpacity={0.8}
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                            className="p-4 rounded-2xl border w-[48%] mb-4"
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Ionicons name="heart" size={18} color={isDarkMode ? "#34D399" : "#10B981"} />
                                </View>
                                <View style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }} className="px-2 py-0.5 rounded-md">
                                    <Text style={{ color: isDarkMode ? '#34D399' : '#10B981', fontSize: wp(2.5) }} className="font-[Outfit-Bold]">{stats.saved}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: wp(3.6), color: primaryText }} className="font-[Outfit-Bold]">Saved</Text>
                            <Text style={{ fontSize: wp(2.8), color: secondaryText }} className="font-[Outfit-Medium] mt-0.5">Quick access items</Text>
                        </TouchableOpacity>

                        {/* Settings Card */}
                        <TouchableOpacity
                            onPress={() => router.push("/feature/(home)/profile")}
                            activeOpacity={0.8}
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                            className="p-4 rounded-2xl border w-[48%]"
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View style={{ backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF' }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Ionicons name="settings-outline" size={18} color={isDarkMode ? "#A78BFA" : "#8B5CF6"} />
                                </View>
                            </View>
                            <Text style={{ fontSize: wp(3.6), color: primaryText }} className="font-[Outfit-Bold]">Settings</Text>
                            <Text style={{ fontSize: wp(2.8), color: secondaryText }} className="font-[Outfit-Medium] mt-0.5">Preferences & Account</Text>
                        </TouchableOpacity>

                        {/* Active Status Metric Card */}
                        <View 
                            style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: borderColor }} 
                            className="p-4 rounded-2xl border w-[48%] justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                                <Text style={{ fontSize: wp(3.2), color: primaryText }} className="font-[Outfit-Bold]">Active status</Text>
                            </View>
                            <View className="mt-4">
                                <Text style={{ fontSize: wp(5), color: primaryText }} className="font-[Outfit-Bold]">{stats.active}</Text>
                                <Text style={{ fontSize: wp(2.8), color: secondaryText }} className="font-[Outfit-Medium]">Upcoming trips</Text>
                            </View>
                        </View>
                    </MotiView>
                )}

                {/* Recent Searches Section */}
                <MotiView {...fadeInUp(250)} className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text style={{ fontSize: wp(4.2), color: primaryText }} className="font-[Outfit-Bold] tracking-tight">Recent Searches</Text>
                        <Ionicons name="time-outline" size={18} color={secondaryText} />
                    </View>
                    
                    {recentSearches.length > 0 ? (
                        recentSearches.map((search, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => handleSearchClick(search)}
                                activeOpacity={0.7}
                                style={{ backgroundColor: cardBg, borderColor: borderColor }}
                                className="p-3.5 rounded-xl border mb-2 flex-row justify-between items-center"
                            >
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: borderColor }} className="w-8 h-8 rounded-lg items-center justify-center mr-3 border">
                                        <Ionicons name="location-outline" size={14} color={isDarkMode ? '#38BDF8' : '#003580'} />
                                    </View>
                                    <Text style={{ fontSize: wp(3.4), color: primaryText }} className="font-[Outfit-Medium]">
                                        {search.from} <Text className="text-slate-400 font-[Outfit-Regular]">➔</Text> {search.to}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: wp(2.8), color: secondaryText }} className="font-[Outfit-Medium]">{search.date || "Jun 2026"}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TouchableOpacity
                            onPress={() => router.push('/feature/search/screens/all-search')}
                            style={{ 
                                backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', 
                                borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                                borderStyle: 'dashed'
                            }}
                            className="p-6 rounded-2xl border items-center justify-center"
                        >
                            <View style={{ backgroundColor: isDarkMode ? '#0F172A' : '#EFF6FF' }} className="w-12 h-12 rounded-full items-center justify-center mb-3">
                                <Ionicons name="search-outline" size={24} color={isDarkMode ? '#38BDF8' : '#003580'} />
                            </View>
                            <Text style={{ fontSize: wp(3.8), color: primaryText }} className="font-[Outfit-Bold] text-center">
                                No recent searches
                            </Text>
                            <Text style={{ fontSize: wp(3.0), color: secondaryText }} className="font-[Outfit-Medium] text-center mt-1 mb-4">
                                Tap to explore available flight, train, and bus routes!
                            </Text>
                            <View style={{ backgroundColor: isDarkMode ? '#38BDF8' : '#003580' }} className="px-5 py-2.5 rounded-xl">
                                <Text style={{ color: isDarkMode ? '#0F172A' : 'white' }} className="font-[Outfit-Bold] text-xs">
                                    Explore Routes
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </MotiView>

                {/* Recent Trips Section */}
                <View className="mb-6">
                    <MotiView
                        {...fadeInUp(350)}
                        className="flex-row justify-between items-center mb-3"
                    >
                        <Text style={{ fontSize: wp(4.2), color: primaryText }} className="font-[Outfit-Bold] tracking-tight">Recent History</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={{ fontSize: wp(3.2), color: isDarkMode ? '#38BDF8' : '#003580' }} className="font-[Outfit-Bold]">View History</Text>
                        </TouchableOpacity>
                    </MotiView>

                    {recentTrip ? (
                        <MotiView
                            {...fadeInUp(400)}
                            style={{ padding: wp(3), backgroundColor: cardBg, borderColor: borderColor }}
                            className="border rounded-2xl flex-row items-center"
                        >
                            <Image
                                source={{ uri: recentTrip.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' }}
                                style={{ width: wp(12), height: wp(12) }}
                                className="rounded-xl"
                            />
                            <View className="ml-3.5 flex-1">
                                <Text style={{ fontSize: wp(3.6), color: primaryText }} className="font-[Outfit-Bold]" numberOfLines={1}>
                                    {recentTrip.destination ||
                                        `${recentTrip.departureLocation?.name || recentTrip.from || '?'} ➔ ${recentTrip.arrivalLocation?.name || recentTrip.to || '?'}`}
                                </Text>
                                <Text style={{ fontSize: wp(3), color: secondaryText }} className="font-[Outfit-Medium] mt-0.5">
                                    {new Date(recentTrip.startDate || recentTrip.bookingDate || recentTrip.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderColor: borderColor }} className="border px-2.5 py-1 rounded-lg flex-row items-center">
                                <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                                <Text style={{ fontSize: wp(2.6), color: secondaryText }} className="font-[Outfit-Bold]">Past</Text>
                            </View>
                        </MotiView>
                    ) : (
                        <MotiView
                            {...fadeInUp(400)}
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                            className="border rounded-2xl p-6 items-center"
                        >
                            <Ionicons name="airplane-outline" size={28} color={secondaryText} />
                            <Text style={{ fontSize: wp(3.2), color: secondaryText }} className="font-[Outfit-Medium] mt-2">No history logs yet.</Text>
                        </MotiView>
                    )}
                </View>

                {/* Focus Journey/Upcoming Trip Section */}
                <View>
                    <MotiText
                        {...fadeInUp(450)}
                        style={{ fontSize: wp(4.2), color: primaryText }}
                        className="font-[Outfit-Bold] mb-3 tracking-tight"
                    >
                        Focus Journey
                    </MotiText>

                    {upcomingTrip ? (
                        <MotiView
                            {...fadeInUp(500)}
                            style={{ padding: wp(4), backgroundColor: cardBg, borderColor: borderColor }}
                            className="border rounded-2xl flex-row items-center"
                        >
                            <Image
                                source={{ uri: upcomingTrip.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' }}
                                style={{ width: wp(20), height: wp(20) }}
                                className="rounded-xl"
                            />
                            <View className="ml-4 flex-1">
                                <View className="flex-row items-center justify-between">
                                    <View style={{ backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.1)' : '#FFEDD5', borderColor: isDarkMode ? 'rgba(249, 115, 22, 0.3)' : '#FED7AA' }} className="border px-2 py-0.5 rounded-md">
                                        <Text style={{ fontSize: wp(2.5), color: '#EA580C' }} className="font-[Outfit-Bold]">CONFIRMED</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: wp(3.8), color: primaryText }} className="font-[Outfit-Bold] mt-2" numberOfLines={1}>
                                    {upcomingTrip.title ||
                                        `${upcomingTrip.departureLocation?.name || '?'} ➔ ${upcomingTrip.arrivalLocation?.name || '?'}`}
                                </Text>
                                <Text style={{ fontSize: wp(3), color: secondaryText }} className="font-[Outfit-Medium] mt-1">
                                    Departs {new Date(upcomingTrip.startDate || upcomingTrip.bookingDate || upcomingTrip.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </MotiView>
                    ) : (
                        <MotiView
                            {...fadeInUp(500)}
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                            className="border rounded-2xl p-6 items-center"
                        >
                            <Ionicons name="calendar-outline" size={28} color={secondaryText} />
                            <Text style={{ fontSize: wp(3.2), color: secondaryText }} className="font-[Outfit-Medium] mt-2">No active itineraries.</Text>
                        </MotiView>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}