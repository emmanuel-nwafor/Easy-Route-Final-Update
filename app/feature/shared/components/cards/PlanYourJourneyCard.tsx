import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from "expo-router";

// Import our custom modals
import LocationSelectionModal from "../modals/LocationModal";
import { DatePickerModal, TravellerModal, TransportModal } from "../modals/SelectionModals";
import { useLocation } from "../../hooks/useLocation";

export default function PlanYourJourneyCard() {
    const router = useRouter();
    const { getLocation, isLoading: isLocating } = useLocation();

    // -- State --
    const [from, setFrom] = useState('Current Location');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('Dec 15, 2025');
    const [travellers, setTravellers] = useState({ adults: 1, children: 0 });
    const [transport, setTransport] = useState('Flight');

    // -- Modal Visibility --
    const [modal, setModal] = useState<'from' | 'to' | 'date' | 'travellers' | 'transport' | null>(null);

    const handleSearch = () => {
        // Build query params or navigate to plan screen with pre-filled state
        router.push({
            pathname: '/feature/search/screens/all-search',
            params: { from, to, date, transport, adults: travellers.adults, children: travellers.children }
        });
    };

    const handleDetectLocation = async () => {
        const loc = await getLocation();
        if (loc?.city) {
            setFrom(loc.city);
        }
        setModal(null);
    };

    return (
        <View
            style={{ marginTop: hp(3), borderRadius: wp(5) }}
            className="bg-white p-5 shadow-sm border border-slate-100"
        >
            <Text style={{ fontSize: wp(4.5) }} className="font-[Outfit-Bold] text-slate-900 mb-4">
                Plan Your Journey
            </Text>

            {/* Location Inputs */}
            <View className="space-y-3">
                <TouchableOpacity
                    onPress={() => setModal('from')}
                    style={{ paddingVertical: hp(1.5) }}
                    className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4"
                >
                    <Ionicons name="location-sharp" size={wp(4.5)} color="#003580" />
                    <View className="ml-3 flex-1">
                        <Text style={{ fontSize: wp(2.5) }} className="text-[#003580] font-[Outfit-Bold] uppercase">From</Text>
                        <Text style={{ fontSize: wp(3.5) }} className={`font-[Outfit-Medium] ${from ? 'text-slate-900' : 'text-slate-400'}`}>
                            {from || 'Current Location'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setModal('to')}
                    style={{ paddingVertical: hp(1.5) }}
                    className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 mt-3"
                >
                    <Ionicons name="location-outline" size={wp(4.5)} color="#94A3B8" />
                    <View className="ml-3 flex-1">
                        <Text style={{ fontSize: wp(2.5) }} className="text-slate-400 font-[Outfit-Bold] uppercase">To</Text>
                        <Text style={{ fontSize: wp(3.5) }} className={`font-[Outfit-Medium] ${to ? 'text-slate-900' : 'text-slate-400'}`}>
                            {to || 'Where to?'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Date & Time Row */}
            <View className="flex-row mt-3 space-x-3">
                <TouchableOpacity
                    onPress={() => setModal('date')}
                    style={{ paddingVertical: hp(1.5) }}
                    className="flex-1 flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-3"
                >
                    <Ionicons name="calendar-outline" size={wp(4)} color="#94A3B8" />
                    <View className="ml-2">
                        <Text style={{ fontSize: wp(2.2) }} className="text-slate-400 font-[Outfit-Bold] uppercase">Departure</Text>
                        <Text style={{ fontSize: wp(3.2) }} className="font-[Outfit-Bold] text-slate-900">{date}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingVertical: hp(1.5) }} className="flex-1 flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-3">
                    <Ionicons name="time-outline" size={wp(4)} color="#94A3B8" />
                    <View className="ml-2">
                        <Text style={{ fontSize: wp(2.2) }} className="text-slate-400 font-[Outfit-Bold] uppercase">Time</Text>
                        <Text style={{ fontSize: wp(3.2) }} className="font-[Outfit-Bold] text-slate-900">10:00 AM</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Return & Action Grid */}
            <View className="flex-row mt-3 space-x-3">
                <View className="flex-1 flex-row space-x-2">
                    <TouchableOpacity
                        onPress={() => setModal('travellers')}
                        style={{ paddingVertical: hp(1.5) }}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl items-center justify-center p-1"
                    >
                        <Ionicons name="person-outline" size={wp(4)} color="#94A3B8" />
                        <Text numberOfLines={1} style={{ fontSize: wp(2.3) }} className="font-[Outfit-Bold] text-slate-900 mt-1">
                            {travellers.adults} Ad, {travellers.children} Ch
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setModal('transport')}
                        style={{ paddingVertical: hp(1.5) }}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl items-center justify-center"
                    >
                        <Ionicons name="airplane-outline" size={wp(4)} color="#94A3B8" />
                        <Text style={{ fontSize: wp(2.5) }} className="font-[Outfit-Bold] text-slate-900 mt-1">{transport}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Button */}
            <TouchableOpacity
                style={{ paddingVertical: hp(2), marginTop: hp(2.5), borderRadius: wp(4) }}
                onPress={handleSearch}
                className="bg-[#003580] flex-row justify-center items-center shadow-md shadow-blue-900/20"
            >
                <Ionicons name="search" size={wp(4.5)} color="white" />
                <Text style={{ fontSize: wp(4) }} className="text-white font-[Outfit-Bold] ml-2">Search Routes</Text>
            </TouchableOpacity>

            {/* Modals Sync */}
            <LocationSelectionModal
                visible={modal === 'from'}
                onClose={() => setModal(null)}
                title="Select Departure City"
                onSelect={setFrom}
                onDetectLocation={handleDetectLocation}
                isDetecting={isLocating}
            />
            <LocationSelectionModal
                visible={modal === 'to'}
                onClose={() => setModal(null)}
                title="Where to?"
                onSelect={setTo}
            />
            <DatePickerModal
                visible={modal === 'date'}
                onClose={() => setModal(null)}
                onSelect={setDate}
            />
            <TravellerModal
                visible={modal === 'travellers'}
                onClose={() => setModal(null)}
                adults={travellers.adults}
                childrenCount={travellers.children}
                onUpdate={(type, val) => setTravellers(prev => ({ ...prev, [type]: val }))}
            />
            <TransportModal
                visible={modal === 'transport'}
                onClose={() => setModal(null)}
                currentMode={transport}
                onSelect={setTransport}
            />
        </View>
    );
}