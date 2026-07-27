import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StatusBar,
    Image, Share, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MotiView, AnimatePresence } from 'moti';
import { useAuth } from '../../shared/data/AuthContext';
import { PlansService } from '../../shared/data/services/plans.service';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { APP_VARIANT } from '../../shared/data/appConfig';
import { Toast, useToast } from 'react-native-toast-notifications';
import { useBookingDetails } from '../../../../hooks/useBookingDetails';
import { translateAirportCode } from '../../../../constants';

export default function BookingDetailsScreen() {
    const params = useLocalSearchParams();
    const { user } = useAuth();

    const {
        id,
        type,
        operator,
        from,
        to,
        date,
        time,
        seat,
        travelClass,
        status,
        confirmationRef,
        isCancelling,
        isDownloading,
        plan,
        activities,
        isLoadingPlan,
        weatherSwapped,
        vaultDocs,
        isUploadingDoc,
        selectedPin,
        setSelectedPin,
        isDarkMode,
        handleSwapActivities,
        handleWeatherOptimize,
        handleOcrAutoImport,
        handleShare,
        handleDownloadPDF,
        handleCancelBooking,
        router
    } = useBookingDetails(params);

    const isCancelled = status?.toLowerCase() === 'cancelled';

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 pt-14 pb-4 flex-row items-center justify-between bg-white border-b border-slate-50">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
                    <Ionicons name="chevron-back" size={24} color="#003580" />
                </TouchableOpacity>
                <Text className="font-[Outfit-Bold] text-lg text-slate-900">Digital Ticket</Text>
                <TouchableOpacity onPress={handleShare} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
                    <Ionicons name="share-outline" size={22} color="#003580" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {type === 'Plan' ? (
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Plan Header Card */}
                        <View className="bg-[#003580] p-6 rounded-[24px]">
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="compass" size={20} color="white" />
                                    <Text className="text-white font-[Outfit-Bold] text-base ml-2">{to} Adventure</Text>
                                </View>
                                <View className="bg-emerald-400 px-2 py-0.5 rounded-full">
                                    <Text className="text-white font-[Outfit-Bold] text-[10px] uppercase">Plan Mode</Text>
                                </View>
                            </View>
                            <Text className="text-white/60 font-[Outfit-Medium] text-xs">Date Range</Text>
                            <Text className="text-white font-[Outfit-Bold] text-sm mb-4">{date} - 7 Days</Text>
                            <View className="flex-row justify-between pt-4 border-t border-white/10">
                                <View>
                                    <Text className="text-white/60 text-[10px] font-[Outfit-Medium]">EST. BUDGET</Text>
                                    <Text className="text-white font-[Outfit-Bold] text-sm">£{plan?.budget || '1,200'}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white/60 text-[10px] font-[Outfit-Medium]">PACE</Text>
                                    <Text className="text-white font-[Outfit-Bold] text-sm">{plan?.details?.tripPace || 'Balanced'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Advanced UI Exclusive: Weather Optimizer Banner */}
                        {APP_VARIANT === 'advanced' && !weatherSwapped && (
                            <MotiView 
                                from={{ opacity: 0, translateY: -10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex-row items-start justify-between"
                            >
                                <View className="flex-1 mr-3">
                                    <View className="flex-row items-center mb-1">
                                        <Ionicons name="rainy-outline" size={16} color="#D97706" />
                                        <Text className="text-[#D97706] font-[Outfit-Bold] text-xs ml-1.5">Weather Delay Warning</Text>
                                    </View>
                                    <Text className="text-slate-500 font-[Outfit-Medium] text-[11px] leading-relaxed">
                                        High chance of rain predicted for tomorrow! Click to automatically swap outdoor sight activity with indoor food tour.
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={handleWeatherOptimize}
                                    className="bg-[#D97706] px-3 py-2 rounded-xl"
                                >
                                    <Text className="text-white font-[Outfit-Bold] text-[11px]">Optimize</Text>
                                </TouchableOpacity>
                            </MotiView>
                        )}

                        {/* Timeline Builder */}
                        <View className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
                            <Text className="font-[Outfit-Bold] text-slate-800 text-base mb-4">
                                {APP_VARIANT === 'advanced' ? "Drag & Drop Timeline Builder" : "Itinerary Schedule"}
                            </Text>

                            {isLoadingPlan ? (
                                <ActivityIndicator color="#003580" />
                            ) : activities.length > 0 ? (
                                <View className="space-y-4">
                                    {activities.map((act, index) => (
                                        <View key={act.id || act._id || `act-${index}`} className="flex-row items-start">
                                            <View className="items-center mr-3 mt-1">
                                                <View className={`w-8 h-8 rounded-full items-center justify-center ${act.type === 'sight' ? 'bg-indigo-50' : 'bg-orange-50'}`}>
                                                    <Ionicons 
                                                        name={act.type === 'sight' ? 'map-outline' : 'restaurant-outline'} 
                                                        size={14} 
                                                        color={act.type === 'sight' ? '#6366F1' : '#F97316'} 
                                                    />
                                                </View>
                                                {index < activities.length - 1 && <View className="w-[1] h-14 bg-slate-100 my-1" />}
                                            </View>
                                            <View className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <View className="flex-row justify-between items-start">
                                                    <Text className="text-[#003580] font-[Outfit-Bold] text-xs">{act.time}</Text>
                                                    {APP_VARIANT === 'advanced' && index < activities.length - 1 && (
                                                        <TouchableOpacity 
                                                            onPress={() => handleSwapActivities(index, index + 1)}
                                                            className="bg-white p-1 rounded border border-slate-200"
                                                        >
                                                            <Ionicons name="swap-vertical" size={10} color="#64748B" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <Text className="text-slate-800 font-[Outfit-Bold] text-xs mt-1">{act.title}</Text>
                                                <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] mt-0.5">Duration: {act.duration}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-slate-400 text-xs font-[Outfit-Medium] text-center">No activities generated. Check your preferences.</Text>
                            )}
                        </View>

                        {/* Advanced UI Exclusive: Map-Based Day Views */}
                        {APP_VARIANT === 'advanced' && (
                            <View className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
                                <Text className="font-[Outfit-Bold] text-slate-800 text-base mb-1">Map-Based Day Views</Text>
                                <Text className="text-slate-400 font-[Outfit-Medium] text-[11px] mb-4">Color-coded daily Sight & Food clusters to prevent crisscrossing:</Text>
                                
                                <View className="h-64 bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden relative mb-4">
                                    {/* Grid Background lines */}
                                    <View className="absolute inset-0 flex-row justify-between opacity-5">
                                        {[...Array(6)].map((_, i) => <View key={i} className="w-[1] h-full bg-slate-900" />)}
                                    </View>
                                    <View className="absolute inset-0 flex-column justify-between opacity-5">
                                        {[...Array(6)].map((_, i) => <View key={i} className="h-[1] w-full bg-slate-900" />)}
                                    </View>

                                    {/* Map Pins */}
                                    {activities.map((act, index) => {
                                        // Generate spread coordinates on our grid using deterministic math based on the activity index
                                        const leftPercent = 15 + (index * 25) % 70;
                                        const topPercent = 20 + (index * 18) % 60;
                                        const isSelected = selectedPin?.id === act.id;

                                        return (
                                            <TouchableOpacity
                                                key={act.id || act._id || `pin-${index}`}
                                                onPress={() => setSelectedPin(act)}
                                                style={{ position: 'absolute', left: `${leftPercent}%`, top: `${topPercent}%` }}
                                                className="items-center"
                                            >
                                                <MotiView
                                                    animate={{ scale: isSelected ? 1.25 : 1 }}
                                                    className={`w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-md ${
                                                        act.type === 'sight' ? 'bg-indigo-500' : 'bg-orange-500'
                                                    }`}
                                                >
                                                    <Ionicons 
                                                        name={act.type === 'sight' ? 'map-outline' : 'restaurant-outline'} 
                                                        size={14} 
                                                        color="white" 
                                                    />
                                                </MotiView>
                                                <View className="bg-white/90 px-2 py-0.5 rounded-full border border-slate-100 mt-1 shadow-sm">
                                                    <Text className="text-[8px] font-[Outfit-Bold] text-slate-800">Day {act.day}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}

                                    {/* Popover Details Card */}
                                    <AnimatePresence>
                                        {selectedPin && (
                                            <MotiView
                                                from={{ opacity: 0, translateY: 10 }}
                                                animate={{ opacity: 1, translateY: 0 }}
                                                exit={{ opacity: 0, translateY: 10 }}
                                                className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-lg flex-row justify-between items-center"
                                            >
                                                <View className="flex-1 mr-3">
                                                    <View className="flex-row items-center mb-1">
                                                        <View className={`w-2.5 h-2.5 rounded-full mr-2 ${selectedPin.type === 'sight' ? 'bg-indigo-500' : 'bg-orange-500'}`} />
                                                        <Text className="text-slate-400 font-[Outfit-Bold] text-[9px] uppercase tracking-wider">{selectedPin.type}</Text>
                                                    </View>
                                                    <Text className="text-slate-800 font-[Outfit-Bold] text-xs" numberOfLines={1}>{selectedPin.title}</Text>
                                                    <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] mt-0.5">Time: {selectedPin.time} • Duration: {selectedPin.duration}</Text>
                                                </View>
                                                <View className="flex-row items-center space-x-2">
                                                    <TouchableOpacity 
                                                        onPress={() => setSelectedPin(null)}
                                                        className="bg-slate-50 w-8 h-8 rounded-full items-center justify-center border border-slate-100"
                                                    >
                                                        <Ionicons name="close" size={16} color="#64748B" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => Toast.show(`Calculating route to ${selectedPin.title}...`, { type: 'success' })}
                                                        className="bg-[#003580] px-3 h-8 rounded-xl items-center justify-center"
                                                    >
                                                        <Text className="text-white font-[Outfit-Bold] text-[10px]">Navigate</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </MotiView>
                                        )}
                                    </AnimatePresence>
                                </View>
                            </View>
                        )}

                        {/* Advanced UI Exclusive: Document & Booking Vault */}
                        {APP_VARIANT === 'advanced' && (
                            <View className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="font-[Outfit-Bold] text-slate-800 text-base">Document & Booking Vault</Text>
                                    {isUploadingDoc ? (
                                        <ActivityIndicator size="small" color="#003580" />
                                    ) : (
                                        <TouchableOpacity 
                                            onPress={handleOcrAutoImport}
                                            className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                                        >
                                            <Text className="text-[#003580] font-[Outfit-Bold] text-[10px]">OCR Auto-Import</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text className="text-slate-400 font-[Outfit-Medium] text-[11px] mb-4">Auto-imported flight passes, hotel validations, and visas via OCR scan:</Text>
                                
                                <View className="space-y-2">
                                    {vaultDocs.map((doc, index) => (
                                        <View key={doc.id || doc._id || `doc-${index}`} className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <View className="flex-row items-center flex-1 mr-2">
                                                <Ionicons 
                                                    name={doc.type === 'flight' ? 'airplane-outline' : doc.type === 'hotel' ? 'bed-outline' : 'home-outline'} 
                                                    size={16} 
                                                    color="#64748B" 
                                                />
                                                <View className="ml-3 flex-1">
                                                    <Text className="text-slate-800 font-[Outfit-Bold] text-[11px]" numberOfLines={1}>{doc.name}</Text>
                                                    <Text className="text-slate-400 font-[Outfit-Medium] text-[9px]">{doc.size}</Text>
                                                </View>
                                            </View>
                                            <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-row items-center">
                                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                                <Text className="text-[#10B981] font-[Outfit-Bold] text-[8px] ml-1 uppercase">OCR Verified</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </MotiView>
                ) : (
                    <>
                        {/* Ticket Card */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[32px] shadow-xl shadow-slate-200 overflow-hidden border border-slate-100"
                        >
                            {/* Carrier Header */}
                            <View className="bg-[#003580] p-6 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                        <FontAwesome5
                                            name={type === 'flight' ? 'plane' : type === 'train' ? 'train' : 'bus'}
                                            size={18}
                                            color="white"
                                        />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-white/60 font-[Outfit-Medium] text-xs uppercase">Carrier</Text>
                                        <Text className="text-white font-[Outfit-Bold] text-base">{operator || 'Easy Route'}</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white/60 font-[Outfit-Medium] text-xs uppercase">Status</Text>
                                    <View className={`px-2 py-0.5 rounded-full mt-1 ${isCancelled ? 'bg-red-400' : 'bg-emerald-400'}`}>
                                        <Text className="text-white font-[Outfit-Bold] text-[10px] uppercase">{status}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Route */}
                            <View className="p-6">
                                <View className="flex-row items-center justify-between mb-8">
                                    <View className="flex-1">
                                        <Text className="text-slate-400 font-[Outfit-Bold] text-[10px] uppercase tracking-widest mb-1">Origin</Text>
                                        <Text style={{ fontSize: wp(4.5) }} className="text-slate-900 font-[Outfit-Bold]" numberOfLines={1}>{translateAirportCode(from) || '---'}</Text>
                                    </View>
                                    <View className="px-2 items-center">
                                        <Ionicons
                                            name={type === 'flight' ? "airplane" : type === 'train' ? "train" : "bus"}
                                            size={20}
                                            color="#CBD5E1"
                                        />
                                    </View>
                                    <View className="flex-1 items-end">
                                        <Text className="text-slate-400 font-[Outfit-Bold] text-[10px] uppercase tracking-widest mb-1">Destination</Text>
                                        <Text style={{ fontSize: wp(4.5) }} className="text-slate-900 font-[Outfit-Bold]" numberOfLines={1}>{translateAirportCode(to) || '---'}</Text>
                                    </View>
                                </View>

                                {/* Details Grid */}
                                <View className="flex-row flex-wrap border-t border-slate-50 pt-6">
                                    <DetailItem icon="calendar" label="Date" value={date || '—'} />
                                    <DetailItem icon="time" label="Departure" value={time} />
                                    <DetailItem icon="person" label="Passenger" value={user?.name || 'Voyager'} />
                                    <DetailItem icon="card" label="Seat / Class" value={`${seat} (${travelClass})`} />
                                </View>

                                {/* Dashed divider */}
                                <View className="flex-row items-center my-6">
                                    <View className="w-6 h-6 rounded-full bg-[#F8FAFC] -ml-9 border border-slate-100" />
                                    <View className="flex-1 h-[1px] border-t-2 border-dashed border-slate-100 mx-2" />
                                    <View className="w-6 h-6 rounded-full bg-[#F8FAFC] -mr-9 border border-slate-100" />
                                </View>

                                {/* QR Code */}
                                <View className="items-center py-4">
                                    <Image
                                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${confirmationRef}` }}
                                        style={{ width: 140, height: 140 }}
                                        className="opacity-90"
                                    />
                                    <Text className="mt-4 font-[Outfit-Bold] text-slate-300 text-[10px] tracking-widest uppercase">
                                        Ref: {confirmationRef}
                                    </Text>
                                </View>
                            </View>
                        </MotiView>

                        {/* Action Buttons */}
                        <View className="mt-6 space-y-3">
                            {/* Share button */}
                            <TouchableOpacity
                                onPress={handleShare}
                                className="bg-[#003580] py-4 rounded-2xl items-center shadow-lg shadow-blue-900/20 flex-row justify-center"
                            >
                                <Ionicons name="share-social-outline" size={20} color="white" />
                                <Text className="text-white font-[Outfit-Bold] text-base ml-2">Share Ticket</Text>
                            </TouchableOpacity>

                            {/* Download PDF */}
                            <TouchableOpacity
                                onPress={handleDownloadPDF}
                                disabled={isDownloading}
                                className="bg-white border border-slate-200 py-4 rounded-2xl items-center flex-row justify-center"
                            >
                                {isDownloading ? (
                                    <ActivityIndicator size="small" color="#003580" />
                                ) : (
                                    <>
                                        <Ionicons name="document-text-outline" size={20} color="#003580" />
                                        <Text className="text-[#003580] font-[Outfit-Bold] text-base ml-2">Download PDF Ticket</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Cancel booking */}
                            {!isCancelled && (
                                <TouchableOpacity
                                    onPress={handleCancelBooking}
                                    disabled={isCancelling}
                                    className="border border-red-100 bg-red-50 py-4 rounded-2xl items-center flex-row justify-center"
                                >
                                    {isCancelling ? (
                                        <ActivityIndicator size="small" color="#EF4444" />
                                    ) : (
                                        <>
                                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                                            <Text className="text-red-500 font-[Outfit-Bold] text-base ml-2">Cancel Booking</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}

                <TouchableOpacity
                    onPress={() => router.push('/feature/(home)/plan')}
                    className="mt-6 flex-row items-center justify-center space-x-2"
                >
                    <Ionicons name="help-circle-outline" size={20} color="#94A3B8" />
                    <Text className="text-slate-400 font-[Outfit-Medium]">Need help with this booking?</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function DetailItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string }) {
    return (
        <View className="w-1/2 mb-6">
            <View className="flex-row items-center mb-1">
                <Ionicons name={`${icon}-outline` as any} size={14} color="#94A3B8" />
                <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] uppercase ml-1.5">{label}</Text>
            </View>
            <Text className="text-slate-900 font-[Outfit-Bold] text-sm">{value}</Text>
        </View>
    );
}
