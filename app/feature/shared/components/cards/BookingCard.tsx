import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

// Define the interface for the booking data
export interface Booking {
    id: string;
    destination: string;
    route: string;
    date: string;
    image: string;
    status: "Confirmed" | "Completed" | "Cancelled";
    confNumber: string;
}

interface BookingCardProps {
    item: Booking;
    index: number;
    onPressDetails?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ item, index, onPressDetails, onDelete }) => {
    // Animation specific to the card
    const fadeInUp = {
        from: { opacity: 0, translateY: 20 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 800, delay: 300 + index * 100 } as const,
    };

    const isConfirmed = item.status === 'Confirmed';

    return (
        <MotiView
            {...fadeInUp}
            className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm shadow-slate-200"
        >
            <View className="flex-row items-center mb-4">
                <Image
                    source={{ uri: item.image }}
                    style={{ width: wp(16), height: wp(16) }}
                    className="rounded-2xl"
                />
                <View className="ml-4 flex-1">
                    <Text style={{ fontSize: wp(4.2) }} className="font-[Outfit-Bold] text-slate-900">
                        {item.destination}
                    </Text>
                    <Text style={{ fontSize: wp(3.2) }} className="text-slate-500 font-[Outfit-Medium]">
                        {item.route}
                    </Text>
                </View>

                <View className={`px-3 py-1 rounded-full ${isConfirmed ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                    <Text
                        style={{ fontSize: wp(2.8) }}
                        className={`font-[Outfit-Bold] ${isConfirmed ? 'text-[#003580]' : 'text-emerald-600'}`}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="border-t border-dashed border-slate-200 pt-4 flex-row justify-between items-center">
                <View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar-outline" size={14} color="#64748B" />
                        <Text style={{ fontSize: wp(3) }} className="ml-2 text-slate-500 font-[Outfit-Medium]">
                            {item.date}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="ticket-confirmation-outline" size={14} color="#64748B" />
                        <Text style={{ fontSize: wp(3) }} className="ml-2 text-slate-500 font-[Outfit-Medium]">
                            Ref: {item.confNumber}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center space-x-2">
                    {onDelete && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onDelete(item.id)}
                            className="bg-red-50 p-2 rounded-xl border border-red-100 mr-2"
                        >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onPressDetails?.(item.id)}
                        className="bg-slate-900 px-4 py-2 rounded-xl"
                    >
                        <Text style={{ fontSize: wp(3.2) }} className="text-white font-[Outfit-Bold]">Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </MotiView>
    );
};

export default BookingCard;