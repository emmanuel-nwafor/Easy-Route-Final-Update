import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Switch, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { APP_VARIANT } from '../../shared/data/appConfig';
import { useRouteDetails } from '../../../../hooks/useRouteDetails';
import PassengerDetailsModal from '../../shared/components/modals/PassengerDetailsModal';

const { width } = Dimensions.get('window');

export default function RouteDetailsScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    
    const routesStr = typeof params.route === 'string' ? params.route : '{}';
    
    // Delegate state & handlers to hook
    const {
        route,
        activeIndex,
        carouselImages,
        isBooking,
        isSaving,
        passengerName,
        setPassengerName,
        passengerPhone,
        setPassengerPhone,
        seatPreference,
        setSeatPreference,
        mealPreference,
        setMealPreference,
        specialAssistance,
        setSpecialAssistance,
        specialAssistanceType,
        setSpecialAssistanceType,
        specialAssistanceEquipment,
        setSpecialAssistanceEquipment,
        emergencyContactName,
        setEmergencyContactName,
        emergencyContactPhone,
        setEmergencyContactPhone,
        hasInsurance,
        setHasInsurance,
        luggageCount,
        setLuggageCount,
        showDetailsForm,
        setShowDetailsForm,
        travelClass,
        handleScroll,
        handleBookNow,
        handleSaveJourney,
        handleViewInMap
    } = useRouteDetails(routesStr);

    const isAdvanced = APP_VARIANT === 'advanced';

    if (!isAdvanced) {
        // Simple UI Layout: Display only: Full route, Stops, Transport type, Estimated arrival, Walking distance, Journey duration. Buttons: Save Journey, Back.
        return (
            <View className="flex-1 bg-white px-6 pt-16">
                <StatusBar barStyle="dark-content" />

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-6 py-2"
                >
                    <Ionicons name="arrow-back" size={24} color="#64748B" />
                    <Text className="ml-2 font-[Outfit-Bold] text-slate-500 text-base">Back</Text>
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <Text style={{ fontSize: wp(7) }} className="font-[Outfit-Bold] text-slate-900 mb-8">
                        Journey Details
                    </Text>

                    {/* Minimal Information Cards with Large Spacing */}
                    <View className="space-y-6">
                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Full Route</Text>
                            <Text style={{ fontSize: wp(5) }} className="font-[Outfit-Bold] text-[#003580]">
                                {route.from} ➔ {route.to}
                            </Text>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Transport Type</Text>
                            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-800 capitalize">
                                {route.type || 'Flight'} ({route.operator})
                            </Text>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Stops</Text>
                            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-800">
                                Non-stop (Direct)
                            </Text>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Estimated Arrival & Departure</Text>
                            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-800">
                                Departs {route.time || '10:00 AM'} • Arrives {route.arrivalTime || '12:00 PM'}
                            </Text>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Journey Duration</Text>
                            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-800">
                                {route.duration || '2h 00m'}
                            </Text>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 uppercase tracking-wider mb-1">Walking Distance</Text>
                            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-800">
                                Approx. 10 - 15 minutes walking
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Action Buttons (Save and Book Now) */}
                <View className="pb-8 pt-4 bg-white border-t border-slate-50 flex-row gap-4">
                    <TouchableOpacity
                        onPress={handleSaveJourney}
                        disabled={isSaving}
                        className={`flex-1 py-4 rounded-2xl items-center shadow-md flex-row justify-center border ${isSaving ? 'bg-slate-50 border-slate-100' : 'bg-slate-50 border-[#003580]'}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#003580" />
                        ) : (
                            <>
                                <Ionicons name="heart-outline" size={20} color="#003580" />
                                <Text className="text-[#003580] font-[Outfit-Bold] text-lg ml-2">Book & Save</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleBookNow}
                        disabled={isBooking}
                        className={`flex-1 py-4 rounded-2xl items-center shadow-lg flex-row justify-center ${isBooking ? 'bg-slate-400' : 'bg-[#003580] shadow-[#003580]/30'}`}
                    >
                        {isBooking ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-[Outfit-Bold] text-lg">Book Now</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Reusable Passenger Details Modal Form */}
                <PassengerDetailsModal
                    visible={showDetailsForm}
                    onClose={() => setShowDetailsForm(false)}
                    passengerName={passengerName}
                    setPassengerName={setPassengerName}
                    passengerPhone={passengerPhone}
                    setPassengerPhone={setPassengerPhone}
                    seatPreference={seatPreference}
                    setSeatPreference={setSeatPreference}
                    mealPreference={mealPreference}
                    setMealPreference={setMealPreference}
                    specialAssistance={specialAssistance}
                    setSpecialAssistance={setSpecialAssistance}
                    specialAssistanceType={specialAssistanceType}
                    setSpecialAssistanceType={setSpecialAssistanceType}
                    specialAssistanceEquipment={specialAssistanceEquipment}
                    setSpecialAssistanceEquipment={setSpecialAssistanceEquipment}
                    emergencyContactName={emergencyContactName}
                    setEmergencyContactName={setEmergencyContactName}
                    emergencyContactPhone={emergencyContactPhone}
                    setEmergencyContactPhone={setEmergencyContactPhone}
                    hasInsurance={hasInsurance}
                    setHasInsurance={setHasInsurance}
                    luggageCount={luggageCount}
                    setLuggageCount={setLuggageCount}
                    onSubmit={handleBookNow}
                    isSubmitting={isBooking}
                    routeDetailsText={`${route.operator || route.type || 'Travel'} – ${route.from} to ${route.to}`}
                />
            </View>
        );
    }

    // Advanced UI Layout
    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Image Carousel */}
                <View className="relative h-96 bg-slate-100">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {carouselImages.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{ uri: img }}
                                style={{ width, height: 450 }}
                                contentFit="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-14 left-6 w-10 h-10 bg-black/30 rounded-full items-center justify-center p-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Pagination Indicators */}
                    <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-2">
                        {carouselImages.map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                            />
                        ))}
                    </View>
                </View>

                {/* Details Section */}
                <View className="px-6 py-6 rounded-t-3xl bg-white -mt-5 mb-12">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center space-x-2">
                            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                                <MaterialCommunityIcons
                                    name={route.type === 'flight' ? 'airplane' : 'train'}
                                    size={20}
                                    color="#003580"
                                />
                            </View>
                            <View className="ml-2">
                                <Text className="font-[Outfit-Bold] text-2xl text-slate-900">{route.operator || 'Unknown Operator'}</Text>
                                <Text className="font-[Outfit-Medium] text-slate-400 capitalize">{route.type || 'Transport'}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="font-[Outfit-Bold] text-2xl text-[#003580]">${route.price || '0'}</Text>
                            <Text className="font-[Outfit-Medium] text-slate-400 text-xs">Per Person</Text>
                        </View>
                    </View>

                    <View className="my-6 p-5 bg-[#F8FAFC] rounded-3xl border border-slate-100 flex-row items-center justify-between">
                        <View className="items-center">
                            <Ionicons name="time-outline" size={24} color="#0F172A" />
                            <Text className="font-[Outfit-Bold] text-slate-900 mt-1">{route.time || '--:--'}</Text>
                            <Text className="font-[Outfit-Medium] text-slate-400 text-xs">Departure</Text>
                        </View>
                        <View className="h-10 w-[1px] bg-slate-200" />
                        <View className="items-center">
                            <Ionicons name="hourglass-outline" size={24} color="#0F172A" />
                            <Text className="font-[Outfit-Bold] text-slate-900 mt-1">{route.duration || '-- hr'}</Text>
                            <Text className="font-[Outfit-Medium] text-slate-400 text-xs">Duration</Text>
                        </View>
                        <View className="h-10 w-[1px] bg-slate-200" />
                        <View className="items-center">
                            <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
                            <Text className="font-[Outfit-Bold] text-emerald-500 mt-1">{route.reliability || 'Good'}</Text>
                            <Text className="font-[Outfit-Medium] text-slate-400 text-xs">Reliability</Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="font-[Outfit-Bold] text-lg text-slate-900 mb-3">About this journey</Text>
                        <Text className="font-[Outfit-Medium] text-slate-500 leading-relaxed">
                            Experience a seamless journey with {route.operator}. This {route.type} route offers exceptional comfort and timely departures. Sit back, relax, and enjoy the beautiful views along the way.
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="font-[Outfit-Bold] text-lg text-slate-900 mb-3">Amenities</Text>
                        <View className="flex-row flex-wrap">
                            <View className="flex-row items-center mr-4 mb-3">
                                <Ionicons name="wifi" size={16} color="#0F172A" />
                                <Text className="font-[Outfit-Medium] text-slate-600 ml-1">Free WiFi</Text>
                            </View>
                            <View className="flex-row items-center mr-4 mb-3">
                                <Ionicons name="cafe" size={16} color="#0F172A" />
                                <Text className="font-[Outfit-Medium] text-slate-600 ml-1">Refreshments</Text>
                            </View>
                            <View className="flex-row items-center mr-4 mb-3">
                                <Ionicons name="battery-charging" size={16} color="#0F172A" />
                                <Text className="font-[Outfit-Medium] text-slate-600 ml-1">Power Outlets</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleViewInMap}
                        className="mb-24 py-4 rounded-2xl border border-slate-200 bg-white flex-row items-center justify-center shadow-sm shadow-slate-100"
                    >
                        <MaterialCommunityIcons name="map-search-outline" size={24} color="#003580" />
                        <Text className="font-[Outfit-Bold] text-slate-700 ml-2 text-[15px]">View on Interactive Map</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View className="absolute bottom-5 left-0 right-0 p-6 bg-white border-t border-slate-50 flex-row gap-4">
                <TouchableOpacity
                    onPress={handleSaveJourney}
                    disabled={isSaving}
                    className={`flex-1 py-4 rounded-2xl items-center shadow-md flex-row justify-center border ${isSaving ? 'bg-slate-50 border-slate-100' : 'bg-slate-50 border-[#003580]'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#003580" />
                    ) : (
                        <>
                            <Ionicons name="heart-outline" size={20} color="#003580" />
                            <Text className="text-[#003580] font-[Outfit-Bold] text-lg ml-2">Save</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleBookNow}
                    disabled={isBooking}
                    className={`flex-1 py-4 rounded-2xl items-center shadow-lg flex-row justify-center ${isBooking ? 'bg-slate-400' : 'bg-[#003580] shadow-[#003580]/30'}`}
                >
                    {isBooking ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-[Outfit-Bold] text-lg">Book Now</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Reusable Passenger Details Modal Form */}
            <PassengerDetailsModal
                visible={showDetailsForm}
                onClose={() => setShowDetailsForm(false)}
                passengerName={passengerName}
                setPassengerName={setPassengerName}
                passengerPhone={passengerPhone}
                setPassengerPhone={setPassengerPhone}
                seatPreference={seatPreference}
                setSeatPreference={setSeatPreference}
                mealPreference={mealPreference}
                setMealPreference={setMealPreference}
                specialAssistance={specialAssistance}
                setSpecialAssistance={setSpecialAssistance}
                specialAssistanceType={specialAssistanceType}
                setSpecialAssistanceType={setSpecialAssistanceType}
                specialAssistanceEquipment={specialAssistanceEquipment}
                setSpecialAssistanceEquipment={setSpecialAssistanceEquipment}
                emergencyContactName={emergencyContactName}
                setEmergencyContactName={setEmergencyContactName}
                emergencyContactPhone={emergencyContactPhone}
                setEmergencyContactPhone={setEmergencyContactPhone}
                hasInsurance={hasInsurance}
                setHasInsurance={setHasInsurance}
                luggageCount={luggageCount}
                setLuggageCount={setLuggageCount}
                onSubmit={handleBookNow}
                isSubmitting={isBooking}
                routeDetailsText={`${route.operator || route.type || 'Travel'} – ${route.from} to ${route.to}`}
            />
        </View>
    );
}
