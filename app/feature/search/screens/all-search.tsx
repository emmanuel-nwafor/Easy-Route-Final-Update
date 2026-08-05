import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FilterTabs from "../components/FilterTabs";
import { MotiView } from 'moti';
import RouteCard from "../components/RouteCard";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PlansService } from "../../shared/data/services/plans.service";
import { APP_VARIANT } from "../../shared/data/appConfig";
import { useAuth } from "../../shared/data/AuthContext";
import * as Location from "expo-location";
import { translateAirportCode } from "../../../../constants";

export default function AllRoutesSearchScreen() {
    const router = useRouter();
    const { isDarkMode } = useAuth();
    const params = useLocalSearchParams<{ from?: string, to?: string, date?: string, transport?: string }>();

    const [routes, setRoutes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState("Detecting location...");

    const from = params.from || "LHR";
    const to = params.to || "DPS";
    const date = params.date || "15 Dec, 2025";
    const transport = params.transport || "Flight";

    useEffect(() => {
        loadUserLocation();
    }, []);

    const loadUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                const [geo] = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
                if (geo) {
                    const city = geo.city || geo.subregion || '';
                    const country = geo.country || '';
                    setUserLocation(city && country ? `${city}, ${country}` : country || 'Unknown Location');
                }
            } else {
                setUserLocation('Location Access Denied');
            }
        } catch (err) {
            setUserLocation('Unknown Location');
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [from, to, transport]);

    const fetchRoutes = async () => {
        setIsLoading(true);
        setError("");
        try {
            const type = transport.toLowerCase();
            const data = await PlansService.searchRoutes({ from, to, type });
            setRoutes(data);
        } catch (err) {
            console.error(err);
            setError("Failed to find available routes. Please try again.");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRoutes();
    };

    const handleViewMap = (route: any) => {
        router.push({
            pathname: '/feature/search/screens/map-search',
            params: { routeData: JSON.stringify(route) }
        });
    };

    const handleSelectRoute = (route: any) => {
        router.push({
            pathname: '/feature/search/screens/route-details',
            params: { route: JSON.stringify(route) }
        });
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header Section */}
            <View className="px-6 py-4">
                <Text style={{ fontSize: wp(6), color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="font-[Outfit-Bold]">
                    {translateAirportCode(from)} ➔ {translateAirportCode(to)}
                </Text>
                <Text style={{ fontSize: wp(3.8), color: isDarkMode ? '#94A3B8' : '#64748B' }} className="font-[Outfit-Medium]">
                    {transport} • {date}
                </Text>
            </View>

            {/* Filter Tabs */}
            {APP_VARIANT === 'advanced' ? (
                <FilterTabs />
            ) : (
                <View className="px-6 mb-3">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowFilters(!showFilters)}
                        className="flex-row items-center justify-center bg-white border border-slate-200 py-3 rounded-xl shadow-sm"
                    >
                        <MaterialCommunityIcons name={showFilters ? "filter-remove-outline" : "filter-outline"} size={18} color="#003580" />
                        <Text className="ml-2 font-[Outfit-Bold] text-[#003580] text-sm">
                            {showFilters ? "Hide Search Filters" : "Configure Search Filters"}
                        </Text>
                    </TouchableOpacity>
                    {showFilters && (
                        <View className="mt-4 -mx-6">
                            <FilterTabs />
                        </View>
                    )}
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#003580" />
                }
            >
                {isLoading && !refreshing ? (
                    <View className="flex-1 items-center justify-center p-20">
                        <ActivityIndicator size="large" color="#003580" />
                        <Text className="mt-4 font-[Outfit-Medium] text-slate-400">Discovering best routes...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center p-10">
                        <Text className="text-red-500 font-[Outfit-Bold] text-center">{error}</Text>
                        <TouchableOpacity onPress={fetchRoutes} className="mt-4 bg-[#003580] px-6 py-2 rounded-xl">
                            <Text className="text-white font-[Outfit-Bold]">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : routes.length > 0 ? (
                    routes.map((item, index) => (
                        APP_VARIANT === 'advanced' ? (
                            <RouteCard
                                key={item.id || index}
                                id={item.id}
                                type={item.type as any}
                                time={item.time}
                                from={item.from}
                                to={item.to}
                                operator={item.operator}
                                price={item.price}
                                isRecommended={item.recommended}
                                statusText={item.reliability || item.warning || item.duration}
                                statusType={item.reliability ? 'success' : item.warning ? 'warning' : 'neutral'}
                                delay={index * 150}
                                onSelect={() => handleSelectRoute(item)}
                                onViewMap={() => handleViewMap(item)}
                            />
                        ) : (
                            <MotiView
                                key={item.id || index}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200 mb-4"
                            >
                                <View className="mb-4">
                                    <Text className="font-[Outfit-Bold] text-2xl text-slate-900 mb-1">
                                        {item.departureTime || item.time || '18:41'} ➔ {item.arrivalTime || '22:15'}
                                    </Text>
                                    <Text className="font-[Outfit-Bold] text-slate-800 text-sm mb-2">
                                        {translateAirportCode(item.from)} ➔ {translateAirportCode(item.to)}
                                    </Text>
                                    <Text className="font-[Outfit-Medium] text-slate-400 text-xs">
                                        Duration: {item.duration || '5h 34m'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleSelectRoute(item)}
                                    className="bg-[#003580] py-3.5 rounded-2xl items-center justify-center"
                                >
                                    <Text className="text-white font-[Outfit-Bold] text-sm">View Details</Text>
                                </TouchableOpacity>
                            </MotiView>
                        )
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center p-10">
                        <MaterialCommunityIcons name="airplane-off" size={60} color="#CBD5E1" />
                        <Text className="text-slate-800 font-[Outfit-Bold] text-lg mt-4">No Routes Found</Text>
                        <Text className="text-slate-400 font-[Outfit-Medium] text-center mt-2">
                            {"We couldn't find any routes for this trip. Try different cities or dates."}
                        </Text>
                    </View>
                )}

            </ScrollView>

            <View className="absolute bottom-10 w-full px-4 bg-transparent p-3">
                {/* Footer Action */}
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/feature/search/screens/compare-routes',
                        params: {
                            from,
                            to,
                            routes: JSON.stringify(routes)
                        }
                    })}
                    style={{
                        borderColor: APP_VARIANT === 'advanced' ? '#E2E8F0' : '#003580',
                    }}
                    className="mt-2 py-4 bg-white rounded-2xl items-center flex-row justify-center border shadow-sm"
                >
                    <MaterialCommunityIcons 
                        name={APP_VARIANT === 'advanced' ? "compare" : "apps"} 
                        size={20} 
                        color={APP_VARIANT === 'advanced' ? "#475569" : "#003580"} 
                    />
                    <Text 
                        style={{ 
                            fontSize: wp(3.8), 
                            color: APP_VARIANT === 'advanced' ? "#475569" : "#003580" 
                        }} 
                        className="font-[Outfit-Bold] ml-2"
                    >
                        All Routes
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
