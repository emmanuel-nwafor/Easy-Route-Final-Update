import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { PlansService } from "../../shared/data/services/plans.service";
import { useAuth } from "../../shared/data/AuthContext";
import PassengerDetailsModal from "../../shared/components/modals/PassengerDetailsModal";

export default function MapSearchScreen() {
    const mapRef = useRef<MapView>(null);
    const translateY = useSharedValue(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [isSavingRoute, setIsSavingRoute] = useState(false);
    const [midwayStop, setMidwayStop] = useState<any | null>(null);
    const toast = useToast();
    const router = useRouter();
    const params = useLocalSearchParams<{ routeData?: string }>();
    const { user } = useAuth();

    // Passenger details modal states
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    const [passengerName, setPassengerName] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [seatPreference, setSeatPreference] = useState('Window');
    const [mealPreference, setMealPreference] = useState('Standard');
    const [specialAssistance, setSpecialAssistance] = useState(false);
    const [specialAssistanceType, setSpecialAssistanceType] = useState('Wheelchair');
    const [specialAssistanceEquipment, setSpecialAssistanceEquipment] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [hasInsurance, setHasInsurance] = useState(false);
    const [luggageCount, setLuggageCount] = useState(1);

    // Pre-fill user details if logged in
    useEffect(() => {
        if (user) {
            setPassengerName(user.name || '');
            setPassengerPhone(user.phone || '');
        }
    }, [user]);

    const route = params.routeData ? JSON.parse(params.routeData) : null;

    const handleAddStop = () => {
        if (!route || !route.path || route.path.length < 2) return;
        const start = route.coordinates.origin;
        const end = route.coordinates.destination;
        const midLat = (start.latitude + end.latitude) / 2;
        const midLng = (start.longitude + end.longitude) / 2;
        
        setMidwayStop({ latitude: midLat, longitude: midLng });
        toast.show("Custom layover stop added to map timeline!", { type: "success" });
    };

    const handleSaveRoute = async () => {
        if (!route) return;
        setIsSavingRoute(true);
        try {
            const to = route.to || "Destination";
            const from = route.from || "Origin";
            await PlansService.createPlan({
                title: `${route.operator || route.type || 'Transit'} – ${from} to ${to}`,
                destination: to,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                budget: route.price || 0,
                activities: [
                    {
                        id: `act-auto-${Date.now()}`,
                        day: 1,
                        time: route.departureTime || "10:00 AM",
                        title: `Transit Departure from ${from}`,
                        duration: route.duration || "2h",
                        type: "sight",
                        lat: route.coordinates.origin.latitude,
                        lng: route.coordinates.origin.longitude
                    }
                ],
                status: 'upcoming'
            });
            toast.show("Journey route saved successfully to your Saved Journeys!", { type: "success" });
        } catch (err: any) {
            toast.show(err.message || "Failed to save route", { type: "danger" });
        } finally {
            setIsSavingRoute(false);
        }
    };

    const handleBookRoute = async () => {
        if (!route) return;
        setIsBooking(true);
        setShowDetailsForm(false);
        try {
            // Find destination for the default plan
            const to = route.to || "Destination";
            const from = route.from || "Origin";

            // 1. Get user's plans
            const userPlans = await PlansService.getUserPlans();
            let targetPlanId = userPlans[0]?._id || userPlans[0]?.id;

            // 2. Create default plan if none exists
            if (!targetPlanId) {
                const newPlan = await PlansService.createPlan({
                    title: `Trip to ${to}`,
                    destination: to,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    budget: 1000,
                    activities: [],
                    status: 'upcoming'
                });
                targetPlanId = newPlan._id || newPlan.id;
            }

            // 3. Create the booking
            await PlansService.createBooking(targetPlanId, {
                type: route.type,
                details: JSON.stringify({
                    operator: route.operator,
                    time: route.time,
                    duration: route.duration,
                    price: route.price,
                    passengerName,
                    passengerPhone,
                    mealPreference,
                    seatPreference,
                    specialAssistance,
                    specialAssistanceType,
                    specialAssistanceEquipment,
                    emergencyContactName,
                    emergencyContactPhone,
                    hasInsurance,
                    luggageCount
                }),
                departureLocation: { name: from },
                arrivalLocation: { name: to },
                departureTime: new Date(),
                status: 'confirmed'
            });

            // 4. Success Navigation & Feedback
            toast.show("Booking confirmed! Your journey is ready.", { type: "success" });
            router.push('/feature/(home)/bookings');
        } catch (err: any) {
            toast.show(err.message || "Failed to finalize booking", { type: "danger" });
        } finally {
            setIsBooking(false);
        }
    };

    const FULL_OPEN = 0;
    const HIDDEN_STATE = hp(65);

    useEffect(() => {
        if (route && mapRef.current) {
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(route.path, {
                    edgePadding: { top: 100, right: 100, bottom: 400, left: 100 },
                    animated: true,
                });
            }, 500);
        }
    }, [route]);

    const fastSpring = {
        stiffness: 150,
        damping: 20,
        mass: 0.5
    };

    const toggleFullScreen = () => {
        if (isFullScreen) {
            translateY.value = withSpring(FULL_OPEN, fastSpring);
        } else {
            translateY.value = withSpring(HIDDEN_STATE, fastSpring);
        }
        setIsFullScreen(!isFullScreen);
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const fadeOutStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [0, HIDDEN_STATE * 0.5],
            [1, 0],
            Extrapolate.CLAMP
        );
        return { opacity, display: opacity === 0 ? 'none' : 'flex' };
    });

    if (!route) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>No route selected</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-500">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: route.coordinates.origin.latitude,
                    longitude: route.coordinates.origin.longitude,
                    latitudeDelta: 20,
                    longitudeDelta: 20,
                }}
                customMapStyle={mapStyle}
            >
                <Polyline
                    coordinates={route.path}
                    strokeColor="#3B82F6"
                    strokeWidth={3}
                    lineDashPattern={[1]}
                    geodesic={true}
                />

                <Marker coordinate={route.coordinates.origin}>
                    <View className="bg-white p-2 rounded-full shadow-lg border-2 border-blue-500">
                        <Ionicons name="location" size={18} color="#3B82F6" />
                    </View>
                </Marker>

                <Marker coordinate={route.coordinates.destination}>
                    <View className="bg-white p-2 rounded-full shadow-lg border-2 border-emerald-500">
                        <Ionicons name="flag" size={18} color="#10B981" />
                    </View>
                </Marker>

                {midwayStop && (
                    <Marker coordinate={midwayStop}>
                        <View className="bg-white p-2 rounded-full shadow-lg border-2 border-orange-500">
                            <Ionicons name="stopwatch" size={18} color="#F97316" />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View className="absolute top-14 left-6 right-6 flex-row justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/95 p-3 rounded-2xl shadow-lg border border-slate-100">
                    <Ionicons name="arrow-back" size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleFullScreen}
                    className="bg-white/95 p-3 rounded-2xl shadow-lg border border-slate-100"
                >
                    <Ionicons
                        name={isFullScreen ? "contract" : "expand"}
                        size={20}
                        color="#64748b"
                    />
                </TouchableOpacity>
            </View>

            <Animated.View
                style={[animatedCardStyle, { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }]}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[45px] pt-4"
            >
                <View className="w-12 h-1.5 bg-slate-100 rounded-full self-center mb-6" />

                <View className="px-8 flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
                            {route.carrierLogo ? (
                                <Image source={{ uri: route.carrierLogo }} style={{ width: 24, height: 24 }} resizeMode="contain" />
                            ) : (
                                <MaterialCommunityIcons name={route.type === 'flight' ? "airplane" : "train"} size={20} color="#64748b" />
                            )}
                        </View>
                        <View className="ml-3">
                            <Text style={{ fontSize: wp(4) }} className="font-[Outfit-Bold] text-slate-800">{route.operator}</Text>
                            <Text className="text-slate-400 font-[Outfit-Medium]" style={{ fontSize: wp(2.8) }}>{route.duration} duration</Text>
                        </View>
                    </View>
                    <View className="bg-emerald-50 px-3 py-1 rounded-lg">
                        <Text style={{ fontSize: wp(2.5) }} className="text-emerald-600 font-[Outfit-Bold]">{route.reliability || "On Time"}</Text>
                    </View>
                </View>

                <Animated.View style={fadeOutStyle} className="px-8 overflow-hidden">
                    <View className="flex-row justify-between items-center my-6">
                        <View>
                            <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900">
                                {route.time?.split(' ➔ ')[0] ?? route.from ?? 'Origin'}
                            </Text>
                            <Text style={{ fontSize: wp(3.5) }} className="text-slate-400 font-[Outfit-Medium]">{route.from}</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Ionicons name={route.type === 'flight' ? "airplane" : "train"} size={18} color="#CBD5E1" />
                            <Text style={{ fontSize: wp(2.2) }} className="text-slate-300 font-[Outfit-Medium] mt-1">{route.duration}</Text>
                        </View>
                        <View className="items-end">
                            <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900">
                                {route.time?.split(' ➔ ')[1] ?? route.to ?? 'Destination'}
                            </Text>
                            <Text style={{ fontSize: wp(3.5) }} className="text-slate-400 font-[Outfit-Medium]">{route.to}</Text>
                        </View>
                    </View>
                </Animated.View>

                <View className="px-8 pb-10">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setShowDetailsForm(true)}
                        disabled={isBooking}
                        className="bg-[#003580] py-4 rounded-3xl flex-row justify-center items-center mb-4 shadow-sm"
                    >
                        {isBooking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="navigate-circle" size={20} color="white" />
                                <Text style={{ fontSize: wp(3.8) }} className="text-white font-[Outfit-Bold] ml-2">Book Route for ${route.price}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Animated.View style={fadeOutStyle} className="flex-row gap-4">
                        <TouchableOpacity 
                            onPress={handleAddStop}
                            className="flex-1 bg-slate-50 py-4 rounded-2xl flex-row justify-center items-center border border-slate-100"
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#64748b" />
                            <Text style={{ fontSize: wp(3.2) }} className="text-slate-500 font-[Outfit-Bold] ml-2">
                                {midwayStop ? "Stop Added" : "Add Stop"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleSaveRoute}
                            disabled={isSavingRoute}
                            className="flex-1 bg-slate-50 py-4 rounded-2xl flex-row justify-center items-center border border-slate-100"
                        >
                            {isSavingRoute ? (
                                <ActivityIndicator size="small" color="#64748b" />
                            ) : (
                                <>
                                    <Ionicons name="heart-outline" size={18} color="#F87171" />
                                    <Text style={{ fontSize: wp(3.2) }} className="text-slate-500 font-[Outfit-Bold] ml-2">Save Route</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Animated.View>

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
                onSubmit={handleBookRoute}
                isSubmitting={isBooking}
                routeDetailsText={`${route.operator || route.type || 'Travel'} – ${route.from} to ${route.to}`}
            />
        </View>
    );
}

const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#f1f5f9" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#cbd5e1" }] },
    { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "on" }] },
    { "featureType": "road", "stylers": [{ "visibility": "simplified" }, { "color": "#e2e8f0" }] }
];