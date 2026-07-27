import React from "react";
import { View, ScrollView, StatusBar, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { MotiView, MotiText } from "moti";
import BookingCard, { Booking } from "../shared/components/cards/BookingCard";
import { useAuth } from "../shared/data/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useBookings } from "../../../hooks/useBookings";

export default function BookingsScreen() {
    const {
        activeTab,
        setActiveTab,
        bookings,
        isLoading,
        refreshing,
        upcomingPlans,
        router,
        handleDeletePlan,
        onRefresh
    } = useBookings();

    const { user, isDarkMode } = useAuth();

    return (
        <View className="flex-1" style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" />

            <View className="px-5 pt-14 pb-6 bg-white border-b border-slate-50">
                <MotiText
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={{ fontSize: wp(7) }}
                    className="font-[Outfit-Bold] text-slate-900"
                >
                    Management Hub
                </MotiText>

                <View className="flex-row bg-slate-100 p-1 rounded-2xl mt-6">
                    {(['Tickets', 'Saved Journeys'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''
                                }`}
                        >
                            <Text className={`font-[Outfit-Bold] ${activeTab === tab ? 'text-[#003580]' : 'text-slate-400'
                                }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: wp(5), paddingBottom: hp(10), flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003580" />
                }
            >
                {isLoading && !refreshing ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#003580" />
                        <Text className="mt-4 font-[Outfit-Medium] text-slate-400">Syncing identity hub...</Text>
                    </View>
                ) : activeTab === "Tickets" ? (
                    bookings.length > 0 ? (
                        bookings.map((item, index) => (
                            <BookingCard
                                key={item._id || item.id}
                                item={{
                                    id: item._id || item.id,
                                    destination: `${item.departureLocation?.name || '?'} ➔ ${item.arrivalLocation?.name || '?'}`,
                                    route: `${item.operator || item.details?.operator || 'Carrier'} • ${item.vehicleType || item.type}`,
                                    date: item.departureTime
                                        ? new Date(item.departureTime).toLocaleDateString()
                                        : new Date(item.bookingDate || item.createdAt).toLocaleDateString(),
                                    image: "https://i.pinimg.com/1200x/29/ad/b3/29adb3d01648148b2c4b2326db4e7ab8.jpg",
                                    status: item.status || 'confirmed',

                                    confNumber: item.confirmationNumber || `VY-${(item._id || item.id).substring(0, 6).toUpperCase()}`,
                                }}
                                index={index}
                                onPressDetails={() => router.push({
                                    pathname: '/feature/search/screens/booking-details',
                                    params: {
                                        id: item._id || item.id,
                                        planId: item.plan?._id || item.plan?.id || '',
                                        type: item.vehicleType || item.type,
                                        operator: item.operator || item.details?.operator || '',
                                        from: item.departureLocation?.name || '',
                                        to: item.arrivalLocation?.name || '',
                                        date: item.departureTime
                                            ? new Date(item.departureTime).toLocaleDateString()
                                            : '',
                                        time: item.departureTime
                                            ? new Date(item.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '10:00 AM',
                                        seat: item.seatNumber || 'Auto-assigned',
                                        travelClass: item.travelClass || 'Economy',
                                        status: item.status || 'confirmed',
                                    }
                                })}
                            />
                        ))
                    ) : (
                        <EmptyState 
                            title="No Active Tickets" 
                            subtitle="Once you discover and book a route on the map, your secure email-verified tickets will appear here."
                            icon="ticket-outline"
                        />
                    )
                ) : (
                    upcomingPlans.length > 0 ? (
                        upcomingPlans.map((item, index) => (
                            <BookingCard
                                key={item._id || item.id}
                                item={{
                                    id: item._id || item.id,
                                    destination: item.title,
                                    route: `${item.destination}`,
                                    date: `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`,
                                            image: "https://i.pinimg.com/1200x/29/ad/b3/29adb3d01648148b2c4b2326db4e7ab8.jpg",
                                    status: "Confirmed",
                                    confNumber: `PLN-${(item._id || item.id).substring(0, 6).toUpperCase()}`,
                                }}
                                index={index}
                                onDelete={handleDeletePlan}
                                onPressDetails={() => router.push({
                                    pathname: '/feature/search/screens/booking-details',
                                    params: { 
                                        id: item._id || item.id,
                                        type: "Plan",
                                        operator: item.details?.transport || "Custom Journey",
                                        from: "Origin",
                                        to: item.destination,
                                        date: new Date(item.startDate).toLocaleDateString(),
                                        time: item.details?.departureTime || '10:00 AM',
                                        seat: "N/A",
                                        travelClass: item.details?.travelClass || 'Economy',
                                        status: "Upcoming"
                                    }
                                })}

                            />
                        ))
                    ) : (
                        <EmptyState 
                            title="No Saved Journeys" 
                            subtitle="Start planning or save a journey to see your tailored itineraries here."
                            icon="calendar-outline"
                        />
                    )
                )}

            </ScrollView>
        </View>
    );
}

function EmptyState({ title, subtitle, icon }: { title: string, subtitle: string, icon: any }) {
    return (
        <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 items-center justify-center p-10"
        >
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Ionicons name={icon} size={32} color="#94A3B8" />
            </View>
            <Text className="font-[Outfit-Bold] text-slate-900 text-lg text-center">{title}</Text>
            <Text className="font-[Outfit-Medium] text-slate-400 text-sm text-center mt-2 px-6">
                {subtitle}
            </Text>
        </MotiView>
    );
}
