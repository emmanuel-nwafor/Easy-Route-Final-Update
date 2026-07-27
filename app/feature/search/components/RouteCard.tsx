import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MotiView, AnimatePresence } from 'moti';
import { APP_VARIANT } from "../../shared/data/appConfig";
import { translateAirportCode } from "@/constants";

// Define the shape of our Route data
export interface RouteProps {
    id: string | number;
    type: 'flight' | 'train' | 'bus';
    time: string;
    from: string;
    to: string;
    operator: string;
    price: string;
    thumbnail?: string;
    isRecommended?: boolean;
    statusText?: string;
    statusType?: 'success' | 'warning' | 'neutral';
    delay?: number;
    onSelect?: () => void;
    onViewMap?: () => void;
    style?: ViewStyle;
}

export default function RouteCard({
    type,
    time,
    from,
    to,
    operator,
    price,
    thumbnail,
    isRecommended,
    statusText,
    statusType = 'neutral',
    delay = 0,
    onSelect,
    onViewMap,
    style
}: RouteProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Helper to get icon based on transport type
    const getIcon = () => {
        switch (type) {
            case 'train': return 'train';
            case 'bus': return 'bus';
            default: return 'airplane';
        }
    };

    // Color logic for the status text
    const getStatusColor = () => {
        if (statusType === 'success') return 'text-emerald-500';
        if (statusType === 'warning') return 'text-orange-500';
        return 'text-slate-400';
    };

    // Layout configuration based on Simple vs. Advanced variant
    const isAdvanced = APP_VARIANT === 'advanced';

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: 'timing', duration: 500 }}
            className="bg-white border border-slate-100 rounded-[15px] p-4 mb-4 shadow-sm shadow-slate-200"
            style={style}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-row flex-1">
                    {/* Icon or Thumbnail Container - Shown immediately in Advanced UI, hidden or replaced in Simple UI */}
                    {isAdvanced && (
                        <View className={`rounded-2xl overflow-hidden ${!thumbnail ? (type === 'flight' ? 'bg-blue-50 p-3' : 'bg-green-50 p-3') : ''}`}>
                            {thumbnail ? (
                                <Image 
                                    source={{ uri: thumbnail }} 
                                    style={{ width: wp(12), height: wp(12) }} 
                                    className="rounded-2xl"
                                />
                            ) : (
                                <Ionicons
                                    name={getIcon() as any}
                                    size={wp(6)}
                                    color={type === 'flight' ? '#3B82F6' : '#10B981'}
                                />
                            )}
                        </View>
                    )}

                    <View className={isAdvanced ? "ml-4 flex-1" : "flex-1"}>
                        <View className="flex-row items-center flex-wrap">
                            <Text style={{ fontSize: wp(4.2) }} className="font-[Outfit-Bold] text-slate-900">
                                {time}
                            </Text>
                            {isAdvanced && isRecommended && (
                                <View className="bg-blue-100 px-2 py-0.5 rounded-md ml-2">
                                    <Text style={{ fontSize: wp(2.5) }} className="text-blue-600 font-[Outfit-Bold]">Recommended</Text>
                                </View>
                            )}
                        </View>

                        {/* Essential Details (Always visible) */}
                        <Text style={{ fontSize: wp(3.2) }} className="text-slate-700 font-[Outfit-Bold] mt-1">
                            {translateAirportCode(from)} ➔ {translateAirportCode(to)}
                        </Text>
                        
                        {/* Advanced fields shown immediately, Simple fields hidden */}
                        {isAdvanced ? (
                            <Text style={{ fontSize: wp(3) }} className="text-slate-500 font-[Outfit-Medium] mt-1">
                                {operator}
                            </Text>
                        ) : (
                            <Text style={{ fontSize: wp(3) }} className="text-slate-400 font-[Outfit-Medium] mt-1 capitalize">
                                Type: {type} • Direct
                            </Text>
                        )}
                    </View>
                </View>

                {/* Price Tag (Always visible) */}
                <View className="items-end">
                    <Text style={{ fontSize: wp(4.8) }} className="font-[Outfit-Bold] text-[#003580]">{price}</Text>
                    <Text style={{ fontSize: wp(2.8) }} className="text-slate-400 font-[Outfit-Medium]">per person</Text>
                </View>
            </View>

            {/* Advanced UI displays extra status text immediately */}
            {isAdvanced && statusText && (
                <View className="flex-row items-center mt-3 ml-14 mb-3">
                    <Text className={`${getStatusColor()} font-[Outfit-Bold]`} style={{ fontSize: wp(3) }}>
                        {statusType === 'success' ? '✓ ' : statusType === 'warning' ? '● ' : ''}
                        {statusText}
                    </Text>
                </View>
            )}

            {/* Simple UI: Collapsible Details Row */}
            {!isAdvanced && (
                <TouchableOpacity 
                    onPress={() => setShowDetails(!showDetails)}
                    className="mt-3 py-2 border-t border-slate-50 flex-row justify-between items-center"
                >
                    <Text className="text-slate-400 font-[Outfit-Bold] text-[11px] uppercase">
                        {showDetails ? "Hide Options" : "Show Options & Map"}
                    </Text>
                    <Ionicons name={showDetails ? "chevron-up" : "chevron-down"} size={14} color="#94A3B8" />
                </TouchableOpacity>
            )}

            {/* Collapsible Details Content for Simple UI */}
            <AnimatePresence>
                {(isAdvanced || showDetails) && (
                    <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {!isAdvanced && (
                            <View className="pt-2 pb-1 space-y-1">
                                <Text style={{ fontSize: wp(3.1) }} className="text-slate-600 font-[Outfit-Medium]">
                                    Carrier: <Text className="font-[Outfit-Bold] text-slate-800">{operator}</Text>
                                </Text>
                                {statusText && (
                                    <Text style={{ fontSize: wp(3.1) }} className="text-slate-600 font-[Outfit-Medium]">
                                        Status: <Text className={`${getStatusColor()} font-[Outfit-Bold]`}>{statusText}</Text>
                                    </Text>
                                )}
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="flex-row mt-4 gap-3">
                            <TouchableOpacity
                                onPress={onSelect}
                                activeOpacity={0.8}
                                className="flex-1 bg-[#003580] py-3 rounded-xl items-center shadow-sm shadow-blue-900/20"
                            >
                                <Text style={{ fontSize: wp(3.5) }} className="text-white font-[Outfit-Bold]">Select Route</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onViewMap}
                                activeOpacity={0.6}
                                className="flex-1 bg-white border border-slate-200 py-3 rounded-xl items-center flex-row justify-center"
                            >
                                <Ionicons name="map-outline" size={16} color="#475569" />
                                <Text style={{ fontSize: wp(3.5) }} className="text-slate-600 font-[Outfit-Bold] ml-2">View on Map</Text>
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                )}
            </AnimatePresence>
        </MotiView>
    );
}