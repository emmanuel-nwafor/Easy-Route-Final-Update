import React from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    StatusBar,
    ActivityIndicator,
    Image
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { MotiView, AnimatePresence, MotiText } from "moti";
import PlanHeader from "../shared/components/headers/PlanHeader";
import LocationSelectionModal from "../shared/components/modals/LocationModal";
import { DatePickerModal, TravellerModal, TransportModal, TimePickerModal, TravelClassModal } from "../shared/components/modals/SelectionModals";

import * as Haptics from 'expo-haptics';
import { APP_VARIANT } from "../shared/data/appConfig";
import { usePlan } from "../../../hooks/usePlan";
import { useAuth } from "../shared/data/AuthContext";
import { useRouter } from "expo-router";

export default function PlanScreen() {
    const { isDarkMode } = useAuth();
    const router = useRouter();
    const [isFormDirty, setIsFormDirty] = React.useState(false);
    const {
        budget, setBudget,
        priority, setPriority,
        ecoFriendly, setEcoFriendly,
        accommodation, setAccommodation,
        isGenerating,
        genStep,
        origin, setOrigin,
        destination, setDestination,
        departureDate, setDepartureDate,
        returnDate, setReturnDate,
        departureTime, setDepartureTime,
        travelClass, setTravelClass,
        adults, setAdults,
        children, setChildren,
        transportMode, setTransportMode,
        showMoreOptions, setShowMoreOptions,
        showOriginModal, setShowOriginModal,
        showDestModal, setShowDestModal,
        showDateModal, setShowDateModal,
        showTimeModal, setShowTimeModal,
        showClassModal, setShowClassModal,
        showReturnModal, setShowReturnModal,
        showTravellerModal, setShowTravellerModal,
        showTransportModal, setShowTransportModal,
        isLocating,
        handleDetectLocation,
        handleGeneratePlan,
        // Advanced fields
        tripPace, setTripPace,
        selectedPreferences, setSelectedPreferences
    } = usePlan();

    const handleSearchRoute = () => {
        router.push({
            pathname: '/feature/search/screens/all-search',
            params: {
                from: origin || 'London',
                to: destination || 'Paris',
                date: departureDate || 'Dec 15, 2025',
                transport: transportMode || 'Flight',
                adults: adults,
                children: children
            }
        });
    };

    const [expandedAccordion, setExpandedAccordion] = React.useState<'route' | 'datetime' | 'travellers' | 'preferences' | null>('route');

    // Auto-generation effect for Simple UI mode when all 4 fields are set
    React.useEffect(() => {
        if (APP_VARIANT !== 'advanced' && isFormDirty) {
            const hasOrigin = origin && origin !== "Detecting location...";
            const hasDestination = destination && destination.trim() !== "";
            const hasDate = departureDate && departureDate !== "Select Date" && departureDate.trim() !== "";
            const hasVehicle = transportMode && transportMode.trim() !== "";

            if (hasOrigin && hasDestination && hasDate && hasVehicle && !isGenerating) {
                const timer = setTimeout(() => {
                    setIsFormDirty(false);
                    handleGeneratePlan();
                }, 800);
                return () => clearTimeout(timer);
            }
        }
    }, [origin, destination, departureDate, transportMode, isGenerating, isFormDirty]);

    const getCostOfLiving = (dest: string) => {
        const d = dest ? dest.toLowerCase() : '';
        if (d.includes('bali') || d.includes('thailand') || d.includes('bangkok') || d.includes('jakarta') || d.includes('vietnam')) {
            return { label: 'Low Cost Destination', multiplier: 0.4 };
        }
        if (d.includes('london') || d.includes('paris') || d.includes('tokyo') || d.includes('york') || d.includes('swiss')) {
            return { label: 'Premium Destination', multiplier: 1.6 };
        }
        return { label: 'Moderate Cost Destination', multiplier: 1.0 };
    };

    const colInfo = getCostOfLiving(destination);
    const dailyTarget = Math.round(75 * colInfo.multiplier * (priority === 'Comfort' ? 1.5 : priority === 'Cheapest' ? 0.7 : 1.0));

    // Animation Variants from your Home style
    const fadeInUp = (delay: number) => ({
        from: { opacity: 0, translateY: 20 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 800, delay } as const,
    });

    return (
        <View className="flex-1" style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" />

            <View className="px-4">
                <PlanHeader />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: hp(12), paddingHorizontal: wp(4) }}
            >

                {APP_VARIANT !== 'advanced' ? (
                    <>
                        {/* Dropdown 1: Route */}
                        <TouchableOpacity
                            onPress={() => setExpandedAccordion(expandedAccordion === 'route' ? null : 'route')}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                                marginBottom: 12
                            }}
                            className="shadow-sm"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="map-outline" size={18} color="#003580" />
                                <Text className="font-[Outfit-Bold] text-slate-800 ml-3 text-base">Route</Text>
                            </View>
                            <Ionicons name={expandedAccordion === 'route' ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                        </TouchableOpacity>

                        {expandedAccordion === 'route' && (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200 mb-4">
                                <TouchableOpacity 
                                    onPress={() => setShowOriginModal(true)}
                                    className="mb-4"
                                >
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">From</Text>
                                    <View className="flex-row items-center border-b border-slate-50 pb-3">
                                        <Ionicons name="location" size={wp(5)} color="#003580" />
                                        <Text className={`flex-1 ml-3 font-[Outfit-Bold] ${origin ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {origin || "Detecting location..."}
                                        </Text>
                                        {isLocating ? (
                                            <ActivityIndicator size="small" color="#003580" />
                                        ) : (
                                            <Ionicons name="navigate-circle-outline" size={wp(6)} color="#003580" />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => setShowDestModal(true)}
                                >
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">To</Text>
                                    <View className="flex-row items-center pb-2">
                                        <Ionicons name="airplane" size={wp(5)} color="#EF4444" />
                                        <Text className={`flex-1 ml-3 font-[Outfit-Bold] ${destination ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {destination || "Where are we going?"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                        )}

                        {/* Dropdown 2: Date & Time */}
                        <TouchableOpacity
                            onPress={() => setExpandedAccordion(expandedAccordion === 'datetime' ? null : 'datetime')}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                                marginBottom: 12
                            }}
                            className="shadow-sm"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={18} color="#003580" />
                                <Text className="font-[Outfit-Bold] text-slate-800 ml-3 text-base">Date & Time</Text>
                            </View>
                            <Ionicons name={expandedAccordion === 'datetime' ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                        </TouchableOpacity>

                        {expandedAccordion === 'datetime' && (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                                <TouchableOpacity onPress={() => setShowDateModal(true)}>
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">Departure Date</Text>
                                    <View className="flex-row items-center border-b border-slate-100 pb-2">
                                        <Ionicons name="calendar" size={wp(5)} color="#003580" />
                                        <Text className="ml-3 font-[Outfit-Bold] text-slate-900">{departureDate}</Text>
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                        )}

                        {/* Dropdown 3: Travellers & Mode */}
                        <TouchableOpacity
                            onPress={() => setExpandedAccordion(expandedAccordion === 'travellers' ? null : 'travellers')}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                                marginBottom: 12
                            }}
                            className="shadow-sm"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="people-outline" size={18} color="#003580" />
                                <Text className="font-[Outfit-Bold] text-slate-800 ml-3 text-base">Travellers & Mode</Text>
                            </View>
                            <Ionicons name={expandedAccordion === 'travellers' ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                        </TouchableOpacity>

                        {expandedAccordion === 'travellers' && (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                                <TouchableOpacity onPress={() => setShowTravellerModal(true)} className="mb-4">
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">Travellers</Text>
                                    <View className="flex-row items-center justify-between border-b border-slate-100 pb-2">
                                        <View className="flex-row items-center">
                                            <Ionicons name="person-outline" size={wp(4)} color="#003580" />
                                            <Text className="ml-2 font-[Outfit-Bold] text-slate-900 text-sm">
                                                {adults + children} Guest{adults + children > 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={wp(3)} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>

                                <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-2">Transport Mode</Text>
                                <View className="flex-row justify-between">
                                    {['Flight', 'Train', 'Bus', 'Car'].map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setTransportMode(mode);
                                                setIsFormDirty(true);
                                            }}
                                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border mx-1 ${transportMode === mode ? 'bg-[#003580] border-[#003580]' : 'bg-slate-50 border-slate-100'}`}
                                        >
                                            <FontAwesome5
                                                name={mode === 'Flight' ? 'plane' : mode === 'Car' ? 'car' : mode.toLowerCase()}
                                                size={12}
                                                color={transportMode === mode ? 'white' : '#003580'}
                                            />
                                            <Text className={`ml-1.5 text-[11px] font-[Outfit-Bold] ${transportMode === mode ? 'text-white' : 'text-slate-600'}`}>
                                                {mode}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </MotiView>
                        )}

                        {/* Dropdown 4: Preferences (Optional) */}
                        <TouchableOpacity
                            onPress={() => setExpandedAccordion(expandedAccordion === 'preferences' ? null : 'preferences')}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                                marginBottom: 16
                            }}
                            className="shadow-sm"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="options-outline" size={18} color="#003580" />
                                <Text className="font-[Outfit-Bold] text-slate-800 ml-3 text-base">Preferences (Optional)</Text>
                            </View>
                            <Ionicons name={expandedAccordion === 'preferences' ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                        </TouchableOpacity>

                        {expandedAccordion === 'preferences' && (
                            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                                <View className="mb-4">
                                    <Text className="font-[Outfit-Bold] text-slate-900 text-sm">Budget Range</Text>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={300}
                                        maximumValue={2000}
                                        value={budget}
                                        onValueChange={setBudget}
                                        minimumTrackTintColor="#003580"
                                        maximumTrackTintColor="#E2E8F0"
                                        thumbTintColor="#003580"
                                    />
                                    <View className="flex-row justify-between px-1">
                                        <Text className="text-slate-400 font-[Outfit-Medium] text-[10px]">£300</Text>
                                        <Text className="text-[#003580] font-[Outfit-Bold] text-xs">£{budget}</Text>
                                        <Text className="text-slate-400 font-[Outfit-Medium] text-[10px]">£2,000</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="font-[Outfit-Bold] text-slate-900 text-sm">Accommodation needed?</Text>
                                    <Switch
                                        value={accommodation}
                                        onValueChange={setAccommodation}
                                        trackColor={{ false: "#CBD5E1", true: "#003580" }}
                                    />
                                </View>
                            </MotiView>
                        )}

                        {/* Search Routes CTA Button */}
                        <TouchableOpacity
                            onPress={handleSearchRoute}
                            className="bg-[#003580] py-4 rounded-2xl flex-row justify-center items-center mt-3 shadow-md shadow-blue-900/10"
                        >
                            <Ionicons name="search" size={20} color="white" />
                            <Text className="text-white font-[Outfit-Bold] text-base ml-2">Search Routes</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Travellers & Class */}
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mr-2">
                                <TouchableOpacity onPress={() => setShowTravellerModal(true)}>
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">Travellers</Text>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Ionicons name="person-outline" size={wp(4)} color="#003580" />
                                            <Text className="ml-2 font-[Outfit-Bold] text-slate-900 text-sm">
                                                {adults + children} Guest{adults + children > 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={wp(3)} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-2">
                                <TouchableOpacity onPress={() => setShowClassModal(true)}>
                                    <Text className="text-[12px] font-[Outfit-Medium] text-slate-400 mb-1">Class</Text>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons name="seat-recline-extra" size={wp(4)} color="#003580" />
                                            <Text className="ml-2 font-[Outfit-Bold] text-slate-900 text-sm">
                                                {travelClass}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={wp(3)} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Transport Mode */}
                        <View className="mb-6">
                            <Text className="font-[Outfit-Bold] text-slate-900 mb-3 text-lg">Transport Mode</Text>
                            <View className="flex-row justify-between">
                                {['Flight', 'Train', 'Bus', 'Car'].map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        onPress={() => setTransportMode(mode)}
                                        className={`flex-row items-center px-3 py-2 rounded-xl border ${transportMode === mode ? 'bg-[#003580] border-[#003580]' : 'bg-white border-slate-100'}`}
                                    >
                                        <FontAwesome5
                                            name={mode === 'Car' ? 'car' : mode.toLowerCase()}
                                            size={14}
                                            color={transportMode === mode ? 'white' : '#003580'}
                                        />
                                        <Text className={`ml-2 font-[Outfit-Medium] ${transportMode === mode ? 'text-white' : 'text-slate-600'}`}>
                                            {mode}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Search Route CTA Button */}
                        <TouchableOpacity
                            onPress={handleSearchRoute}
                            className="bg-white border border-[#003580] py-3.5 rounded-2xl flex-row justify-center items-center mb-6 shadow-sm shadow-slate-100"
                        >
                            <Ionicons name="search" size={20} color="#003580" />
                            <Text className="text-[#003580] font-[Outfit-Bold] text-base ml-2">Search Route</Text>
                        </TouchableOpacity>

                        {/* Budget Slider */}
                        <View className="mb-6">
                            <Text className="font-[Outfit-Bold] text-slate-900 text-lg">Budget Range <Text className="text-slate-400 font-[Outfit-Medium] text-sm">(per person)</Text></Text>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={300}
                                maximumValue={2000}
                                value={budget}
                                onValueChange={setBudget}
                                minimumTrackTintColor="#003580"
                                maximumTrackTintColor="#E2E8F0"
                                thumbTintColor="#003580"
                            />
                            <View className="flex-row justify-between px-1">
                                <Text className="text-slate-400 font-[Outfit-Medium]">£300</Text>
                                <Text className="text-[#003580] font-[Outfit-Bold]">£{budget}</Text>
                                <Text className="text-slate-400 font-[Outfit-Medium]">£2,000+</Text>
                            </View>
                        </View>

                        {/* Trip Priority */}
                        <View className="mb-6">
                            <Text className="font-[Outfit-Bold] text-slate-900 mb-3 text-lg">Trip Priority</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['Cheapest', 'Fastest', 'Comfort'].map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => setPriority(p)}
                                        className={`flex-row items-center px-4 py-2 rounded-xl border ${priority === p ? 'bg-[#003580] border-[#003580]' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <Text className={`font-[Outfit-Bold] ${priority === p ? 'text-white' : 'text-slate-600'}`}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={() => setEcoFriendly(!ecoFriendly)}
                                className={`flex-row items-center mt-3 self-start px-3 py-1.5 rounded-lg border ${ecoFriendly ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}
                            >
                                <View className={`w-4 h-4 rounded border mr-2 items-center justify-center ${ecoFriendly ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                    {ecoFriendly && <Ionicons name="checkmark" size={10} color="white" />}
                                </View>
                                <Text className="text-slate-600 font-[Outfit-Medium]">🌱 Eco-friendly</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Advanced UI Exclusive: Smart Budget Estimator */}
                        {APP_VARIANT === 'advanced' && (
                            <View className="mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                <Text className="font-[Outfit-Bold] text-slate-800 text-sm mb-1">Smart Budget Estimator</Text>
                                <Text className="text-slate-400 font-[Outfit-Medium] text-[11px] mb-3">
                                    Based on cost of living at your destination: <Text className="text-slate-700 font-[Outfit-Bold]">{destination || 'Anywhere'}</Text>
                                </Text>
                                <View className="flex-row justify-between items-center bg-white p-3 rounded-xl border border-slate-100 mb-3">
                                    <View>
                                        <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] uppercase">Daily Target</Text>
                                        <Text className="text-[#003580] font-[Outfit-Bold] text-base">£{dailyTarget} / day</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] uppercase">Destination Index</Text>
                                        <Text className="text-emerald-500 font-[Outfit-Bold] text-xs">{colInfo.label}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setBudget(Math.min(2000, Math.max(300, dailyTarget * 7)));
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    }}
                                    className="bg-blue-50 py-2.5 rounded-xl items-center border border-blue-100 flex-row justify-center"
                                >
                                    <Ionicons name="calculator-outline" size={14} color="#003580" className="mr-1.5" />
                                    <Text className="text-[#003580] font-[Outfit-Bold] text-[11px]">Apply recommended 7-day budget: £{Math.min(2000, Math.max(300, dailyTarget * 7))}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Advanced UI Exclusive: Pace & Preference Filters */}
                        {APP_VARIANT === 'advanced' && (
                            <>
                                {/* Pace Selector */}
                                <View className="mb-6">
                                    <Text className="font-[Outfit-Bold] text-slate-900 mb-3 text-lg">Trip Pace</Text>
                                    <View className="flex-row gap-2">
                                        {['Relaxed', 'Balanced', 'Packed'].map((pace) => (
                                            <TouchableOpacity
                                                key={pace}
                                                onPress={() => setTripPace(pace as any)}
                                                className={`flex-1 py-3 rounded-xl border items-center ${tripPace === pace ? 'bg-[#003580] border-[#003580]' : 'bg-white border-slate-100'}`}
                                            >
                                                <Text className={`font-[Outfit-Bold] text-xs ${tripPace === pace ? 'text-white' : 'text-slate-600'}`}>
                                                    {pace}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Travel Preference Chips */}
                                <View className="mb-6">
                                    <Text className="font-[Outfit-Bold] text-slate-900 mb-3 text-lg">Travel Style</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {['Foodie', 'Adventure', 'Culture', 'Relaxation', 'Shopping'].map((pref) => {
                                            const isSelected = selectedPreferences.includes(pref);
                                            return (
                                                <TouchableOpacity
                                                    key={pref}
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
                                                        } else {
                                                            setSelectedPreferences([...selectedPreferences, pref]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}
                                                >
                                                    <Text className={`font-[Outfit-Bold] text-xs ${isSelected ? 'text-[#003580]' : 'text-slate-500'}`}>
                                                        {isSelected ? `✓ ${pref}` : pref}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Accommodation Toggle */}
                        <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                            <Text className="font-[Outfit-Bold] text-slate-900 text-base">Accommodation needed?</Text>
                            <Switch
                                value={accommodation}
                                onValueChange={setAccommodation}
                                trackColor={{ false: "#CBD5E1", true: "#003580" }}
                            />
                        </View>
                    </MotiView>
                )}
            </ScrollView>

            {/* Bottom Button (Advanced UI only) */}
            {APP_VARIANT === 'advanced' && (
                <View className="absolute bottom-6 left-0 right-0 px-4">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleGeneratePlan}
                        disabled={isGenerating}
                        className="bg-[#003580] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-blue-900"
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-[Outfit-Bold] text-lg mr-2">✨ Generate Journey Plan</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Generation Overlay */}
            <AnimatePresence>
                {isGenerating && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/90 items-center justify-center z-50 p-10"
                    >
                        <MotiView
                            from={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', duration: 1000 }}
                            className="bg-white p-8 rounded-[40px] items-center shadow-2xl shadow-slate-300 border border-slate-50"
                        >
                            <MotiView
                                animate={{ rotate: '360deg' }}
                                transition={{ repeat: Infinity, duration: 2000, type: 'timing' }}
                            >
                                <Ionicons name="sparkles" size={wp(15)} color="#003580" />
                            </MotiView>
                            <Text style={{ fontSize: wp(6) }} className="font-[Outfit-Bold] text-slate-900 mt-6 text-center">
                                {genStep === 1 ? "Scanning Global Routes..." :
                                 genStep === 2 ? "Optimizing for Budget..." :
                                 genStep === 3 ? "Crafting Custom Itinerary..." :
                                 "Finalizing Your Journey..."}
                            </Text>
                            <Text className="font-[Outfit-Medium] text-slate-400 mt-2 text-center text-sm">
                                Our AI is analyzing thousands of routes to find your perfect escape.
                            </Text>
                        </MotiView>
                    </MotiView>
                )}
            </AnimatePresence>

            {/* Modals */}
            <LocationSelectionModal 
                visible={showOriginModal}
                onClose={() => setShowOriginModal(false)}
                onSelect={(val) => {
                    setOrigin(val);
                    setIsFormDirty(true);
                }}
                title="Select Starting Point"
                onDetectLocation={handleDetectLocation}
                isDetecting={isLocating}
            />

            <LocationSelectionModal 
                visible={showDestModal}
                onClose={() => setShowDestModal(false)}
                onSelect={(val) => {
                    setDestination(val);
                    setIsFormDirty(true);
                }}
                title="Select Destination"
            />

            <DatePickerModal 
                visible={showDateModal}
                onClose={() => setShowDateModal(false)}
                onSelect={(val) => {
                    setDepartureDate(val);
                    setIsFormDirty(true);
                }}
            />
            
            <DatePickerModal 
                visible={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onSelect={(val) => setReturnDate(val)}
            />

            <TimePickerModal 
                visible={showTimeModal}
                onClose={() => setShowTimeModal(false)}
                onSelect={(val) => setDepartureTime(val)}
            />

            <TravelClassModal 
                visible={showClassModal}
                onClose={() => setShowClassModal(false)}
                currentClass={travelClass}
                onSelect={(val) => setTravelClass(val)}
            />



            <TravellerModal 
                visible={showTravellerModal}
                onClose={() => setShowTravellerModal(false)}
                adults={adults}
                childrenCount={children}
                onUpdate={(type, val) => type === 'adults' ? setAdults(val) : setChildren(val)}
            />

            <TransportModal 
                visible={showTransportModal}
                onClose={() => setShowTransportModal(false)}
                currentMode={transportMode}
                onSelect={(val) => setTransportMode(val)}
            />
        </View>
    );
}