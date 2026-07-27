import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MotiView } from 'moti';
import { PlansService } from '../../shared/data/services/plans.service';
import { useAuth } from '../../shared/data/AuthContext';
import { translateAirportCode } from '@/constants';

export default function CompareRoutesScreen() {
    const { isDarkMode } = useAuth();
    const params = useLocalSearchParams();
    const router = useRouter();
    const [routes, setRoutes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const from = typeof params.from === 'string' ? params.from : 'Anywhere';
    const to = typeof params.to === 'string' ? params.to : 'Everywhere';

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await PlansService.searchRoutes({ from, to });
            setRoutes(data);
        } catch (error) {
            console.error("Failed to fetch routes:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRoutes(true);
    };

    // Filter routes by search keyword
    const filteredRoutes = useMemo(() => {
        if (!searchQuery.trim()) return routes;
        const q = searchQuery.toLowerCase();
        return routes.filter(r =>
            r.operator?.toLowerCase().includes(q) ||
            r.from?.toLowerCase().includes(q) ||
            r.to?.toLowerCase().includes(q) ||
            r.type?.toLowerCase().includes(q) ||
            String(r.price)?.includes(q)
        );
    }, [routes, searchQuery]);

    const handleViewOnMap = (route: any) => {
        router.push({
            pathname: '/feature/search/screens/map-search',
            params: { routeData: JSON.stringify(route) }
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'train': return 'train';
            case 'bus': return 'bus';
            default: return 'airplane';
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={"transparent"} />

            {/* Header */}
            <View 
                style={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9' }}
                className="px-6 pt-14 pb-4 border-b"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ backgroundColor: isDarkMode ? '#334155' : '#F8FAFC' }}
                        className="w-10 h-10 items-center justify-center rounded-full"
                    >
                        <Ionicons name="close" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
                    </TouchableOpacity>
                    <View className="items-center flex-1 mx-2">
                        <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="font-[Outfit-Bold] text-lg text-center" numberOfLines={1}>Select Route</Text>
                        <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium] text-[10px] text-center" numberOfLines={1}>
                            {translateAirportCode(from)} ➔ {translateAirportCode(to)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/feature/search/screens/map-search',
                            params: { from, to, routes: JSON.stringify(routes) }
                        })}
                        style={{ backgroundColor: isDarkMode ? '#334155' : '#F0F9FF', borderColor: isDarkMode ? '#334155' : '#E0F2FE' }}
                        className="w-10 h-10 items-center justify-center rounded-full border"
                    >
                        <Ionicons name="map-outline" size={20} color={isDarkMode ? '#4DB6AC' : '#003580'} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className={`flex-row items-center bg-slate-50 rounded-2xl px-4 h-12 border ${isSearchFocused ? 'border-[#003580]' : 'border-slate-100'}`}>
                    <Ionicons name="search" size={18} color={isSearchFocused ? "#003580" : "#94A3B8"} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder="Search by operator, city, type..."
                        placeholderTextColor="#CBD5E1"
                        className="flex-1 ml-3 font-[Outfit-Medium] text-slate-800"
                        style={{ fontSize: wp(3.8) }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Route count badge */}
                {!isLoading && (
                    <Text style={{ fontSize: wp(3) }} className="text-slate-400 font-[Outfit-Medium] mt-3">
                        {searchQuery ? `${filteredRoutes.length} result${filteredRoutes.length !== 1 ? 's' : ''} for "${searchQuery}"` : `${routes.length} routes available`}
                    </Text>
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#003580" />
                }
            >
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#003580" />
                        <Text className="mt-4 font-[Outfit-Medium] text-slate-400">Loading all routes...</Text>
                    </View>
                ) : filteredRoutes.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <MaterialCommunityIcons name="compare-remove" size={60} color="#CBD5E1" />
                        <Text className="mt-4 font-[Outfit-Bold] text-slate-400 text-center">
                            {searchQuery ? `No routes match "${searchQuery}"` : 'No routes found in the database'}
                        </Text>
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')} className="mt-4 bg-[#003580] px-6 py-2 rounded-xl">
                                <Text className="text-white font-[Outfit-Bold]">Clear Search</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                ) : (
                    <View className="space-y-4">
                        {filteredRoutes.map((route: any, index: number) => (
                            <MotiView
                                key={route._id ?? route.id ?? index}
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: index * 80 }}
                                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200"
                            >
                                {/* Card Header */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                                            <MaterialCommunityIcons
                                                name={getTypeIcon(route.type) as any}
                                                size={20}
                                                color="#003580"
                                            />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="font-[Outfit-Bold] text-slate-900">{route.operator || 'Unknown Operator'}</Text>
                                            <Text className="font-[Outfit-Medium] text-slate-400 text-[10px] uppercase">
                                                {route.type || 'transport'} • {translateAirportCode(route.from)} to {translateAirportCode(route.to)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-[Outfit-Bold] text-[#003580] text-lg">${route.price}</Text>
                                        <Text className="font-[Outfit-Medium] text-slate-400 text-[10px]">Per person</Text>
                                    </View>
                                </View>

                                {/* Stats row */}
                                <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-2xl mb-4">
                                    <View className="items-center flex-1">
                                        <Text className="font-[Outfit-Bold] text-slate-900 text-sm">{route.time || '--'}</Text>
                                        <Text className="font-[Outfit-Medium] text-slate-400 text-[10px]">Departure</Text>
                                    </View>
                                    <View className="h-8 w-[1px] bg-slate-200" />
                                    <View className="items-center flex-1">
                                        <Text className="font-[Outfit-Bold] text-slate-900 text-sm">{route.duration || '--'}</Text>
                                        <Text className="font-[Outfit-Medium] text-slate-400 text-[10px]">Duration</Text>
                                    </View>
                                    <View className="h-8 w-[1px] bg-slate-200" />
                                    <View className="items-center flex-1">
                                        <Text className={`font-[Outfit-Bold] text-sm ${route.reliability?.includes('High') ? 'text-emerald-500' : 'text-orange-500'}`}>
                                            {route.reliability || 'Good'}
                                        </Text>
                                        <Text className="font-[Outfit-Medium] text-slate-400 text-[10px]">Reliability</Text>
                                    </View>
                                </View>

                                {/* CTA Buttons */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => router.push({
                                            pathname: '/feature/search/screens/route-details',
                                            params: { route: JSON.stringify(route) }
                                        })}
                                        className="flex-1 py-3 bg-[#003580] rounded-xl items-center"
                                    >
                                        <Text className="text-white font-[Outfit-Bold]">View Details</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleViewOnMap(route)}
                                        className="flex-1 py-3 bg-slate-50 rounded-xl items-center flex-row justify-center border border-slate-200"
                                    >
                                        <Ionicons name="map-outline" size={16} color="#475569" />
                                        <Text className="text-slate-600 font-[Outfit-Bold] ml-2">View on Map</Text>
                                    </TouchableOpacity>
                                </View>
                            </MotiView>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
