import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

export default function AboutScreen() {
    const router = useRouter();

    const fadeInUp = (delay: number) => ({
        from: { opacity: 0, translateY: 15 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 700, delay } as const,
    });

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="pt-16 px-6 pb-6 bg-white rounded-b-3xl shadow-sm shadow-slate-100 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900 ml-4">About EasyRoute</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
                {/* Intro Card */}
                <MotiView {...fadeInUp(100)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                    <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="sparkles" size={24} color="#003580" />
                    </View>
                    <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-slate-900 mb-2">Our Mission</Text>
                    <Text className="text-slate-500 font-[Outfit-Medium] leading-relaxed">
                        EasyRoute is an experimental travel planner designed to test interface efficiency, user cognitive load, and accessibility standards across multiple build targets.
                    </Text>
                </MotiView>

                {/* Research Scope Card */}
                <MotiView {...fadeInUp(200)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                    <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="git-branch-outline" size={24} color="#10B981" />
                    </View>
                    <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-slate-900 mb-2">UI Variant Study</Text>
                    <Text className="text-slate-500 font-[Outfit-Medium] leading-relaxed mb-4">
                        We offer two compile-time design branches configured to run under identical backend parameters to research interface choices:
                    </Text>
                    
                    <View className="space-y-3">
                        <View className="flex-row items-start mb-2">
                            <Ionicons name="checkmark-circle" size={18} color="#003580" />
                            <View className="ml-2 flex-1">
                                <Text className="font-[Outfit-Bold] text-slate-800 text-sm">Simple UI Mode</Text>
                                <Text className="text-slate-500 text-xs font-[Outfit-Medium]">Hides options, filter drawers, maps, and detailed review grids behind minimal triggers.</Text>
                            </View>
                        </View>
                        <View className="flex-row items-start">
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <View className="ml-2 flex-1">
                                <Text className="font-[Outfit-Bold] text-slate-800 text-sm">Advanced UI Mode</Text>
                                <Text className="text-slate-500 text-xs font-[Outfit-Medium]">Exposes maps, filter categories, transport preferences, and full route details directly on screen.</Text>
                            </View>
                        </View>
                    </View>
                </MotiView>

                {/* Table 4.1 Comparison Card */}
                <MotiView {...fadeInUp(250)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                    <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="swap-horizontal" size={24} color="#D97706" />
                    </View>
                    <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-slate-900 mb-2">Table 4.1: UI Design Comparison</Text>
                    <Text className="text-slate-500 font-[Outfit-Medium] text-xs mb-4">
                        Summary of design aspects analyzed to evaluate usability, cognitive load, and efficiency:
                    </Text>

                    {/* Table Headers */}
                    <View className="flex-row border-b border-slate-100 pb-2 mb-2">
                        <Text className="font-[Outfit-Bold] text-slate-400 text-xs w-[25%]">Aspect</Text>
                        <Text className="font-[Outfit-Bold] text-slate-800 text-xs w-[37.5%] px-1">Simple UI</Text>
                        <Text className="font-[Outfit-Bold] text-[#10B981] text-xs w-[37.5%] px-1">Advanced UI</Text>
                    </View>

                    {/* Row 1: Layout */}
                    <View className="flex-row border-b border-slate-50 py-3">
                        <Text className="font-[Outfit-Bold] text-slate-500 text-xs w-[25%]">Layout</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Clean and minimalist layout</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Richer and denser layout</Text>
                    </View>

                    {/* Row 2: Density */}
                    <View className="flex-row border-b border-slate-50 py-3">
                        <Text className="font-[Outfit-Bold] text-slate-500 text-xs w-[25%]">Density</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Essential journey information only</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Additional contextual information</Text>
                    </View>

                    {/* Row 3: Hierarchy */}
                    <View className="flex-row border-b border-slate-50 py-3">
                        <Text className="font-[Outfit-Bold] text-slate-500 text-xs w-[25%]">Hierarchy</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Strong emphasis on primary actions</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Multiple visual elements displayed simultaneously</Text>
                    </View>

                    {/* Row 4: Route Info */}
                    <View className="flex-row border-b border-slate-50 py-3">
                        <Text className="font-[Outfit-Bold] text-slate-500 text-xs w-[25%]">Route Info</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Basic route summary</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Detailed route information with supporting visuals</Text>
                    </View>

                    {/* Row 5: Interaction */}
                    <View className="flex-row py-3">
                        <Text className="font-[Outfit-Bold] text-slate-500 text-xs w-[25%]">Interaction</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Essential controls only</Text>
                        <Text className="text-slate-600 text-[11px] font-[Outfit-Medium] w-[37.5%] px-1">Additional filtering and interaction options</Text>
                    </View>
                </MotiView>

                {/* Specs Card */}
                <MotiView {...fadeInUp(300)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="cube-outline" size={24} color="#8B5CF6" />
                    </View>
                    <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-slate-900 mb-4">Application Details</Text>
                    
                    <View className="border-b border-slate-50 pb-3 mb-3 flex-row justify-between">
                        <Text className="text-slate-400 font-[Outfit-Medium]">Version</Text>
                        <Text className="text-slate-700 font-[Outfit-Bold]">1.0.4</Text>
                    </View>
                    <View className="border-b border-slate-50 pb-3 mb-3 flex-row justify-between">
                        <Text className="text-slate-400 font-[Outfit-Medium]">Framework</Text>
                        <Text className="text-slate-700 font-[Outfit-Bold]">React Native (Expo SDK 53)</Text>
                    </View>
                    <View className="border-b border-slate-50 pb-3 mb-3 flex-row justify-between">
                        <Text className="text-slate-400 font-[Outfit-Medium]">State Management</Text>
                        <Text className="text-slate-700 font-[Outfit-Bold]">Zustand + AsyncStorage</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-slate-400 font-[Outfit-Medium]">Environment</Text>
                        <Text className="text-slate-700 font-[Outfit-Bold]">Production Build Ready</Text>
                    </View>
                </MotiView>
            </ScrollView>
        </View>
    );
}
