import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { useLocation } from "../app/feature/shared/hooks/useLocation";
import { PlansService } from "../app/feature/shared/data/services/plans.service";
import * as SecureStore from 'expo-secure-store';
import { APP_VARIANT } from "../app/feature/shared/data/appConfig";

export function usePlan() {
    const [budget, setBudget] = useState(1200);
    const [priority, setPriority] = useState("Fastest");
    const [ecoFriendly, setEcoFriendly] = useState(false);
    const [accommodation, setAccommodation] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genStep, setGenStep] = useState(0);
    
    // Origin & Destination State
    const [origin, setOrigin] = useState("London, UK");
    const [destination, setDestination] = useState("");
    
    // Detailed Planning State
    const [departureDate, setDepartureDate] = useState(
        APP_VARIANT === "advanced" ? "Dec 15, 2025" : "Select Date"
    );
    const [returnDate, setReturnDate] = useState<string | null>(null);
    const [departureTime, setDepartureTime] = useState("10:00 AM");
    const [travelClass, setTravelClass] = useState("Economy");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [transportMode, setTransportMode] = useState(
        APP_VARIANT === "advanced" ? "Flight" : ""
    );
    const [showMoreOptions, setShowMoreOptions] = useState(false);

    // Advanced UI Exclusive States
    const [tripPace, setTripPace] = useState<"Relaxed" | "Balanced" | "Packed">("Balanced");
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>(["Culture"]);
    
    // Modal Visibility
    const [showOriginModal, setShowOriginModal] = useState(false);
    const [showDestModal, setShowDestModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showTravellerModal, setShowTravellerModal] = useState(false);
    const [showTransportModal, setShowTransportModal] = useState(false);

    const router = useRouter();
    const toast = useToast();
    const { location, isLoading: isLocating, getLocation } = useLocation();

    const handleDetectLocation = async () => {
        await getLocation();
    };

    // Effect to update origin when location is detected
    useEffect(() => {
        if (location?.address) {
            setOrigin(`${location.address}`);
            toast.show("Location detected!", { type: "success" });
        }
    }, [location]);

    const handleGeneratePlan = async () => {
        if (!destination) {
            toast.show("Please select a destination", { type: "warning" });
            return;
        }

        setIsGenerating(true);
        setGenStep(1);

        try {
            // Steps for "AI Generation" effect
            const steps = [
                "Scanning Global Routes...",
                "Optimizing for Budget...",
                "Crafting Custom Itinerary...",
                "Finalizing Your Journey..."
            ];

            for (let i = 0; i < steps.length; i++) {
                setGenStep(i + 1);
                // Pause for dramatic effect
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Create activities according to preferences and pace!
            const activities = [];
            const paceDays = tripPace === "Relaxed" ? 2 : tripPace === "Balanced" ? 3 : 5;
            
            // Seed daily items
            for (let day = 1; day <= 3; day++) {
                if (selectedPreferences.includes("Foodie")) {
                    activities.push({
                        id: `act-f-${day}`,
                        day,
                        time: "09:00 AM",
                        title: `Local Food Tour - Day ${day}`,
                        duration: "2h 30m",
                        type: "restaurant",
                        lat: 48.8584 + (day * 0.002),
                        lng: 2.2945 - (day * 0.002),
                    });
                }
                activities.push({
                    id: `act-c-${day}`,
                    day,
                    time: "02:00 PM",
                    title: `Cultural Museum Visit - Day ${day}`,
                    duration: "3h 00m",
                    type: "sight",
                    lat: 48.8606 + (day * 0.003),
                    lng: 2.3376 - (day * 0.003),
                });
                if (paceDays > 3) {
                    activities.push({
                        id: `act-a-${day}`,
                        day,
                        time: "07:30 PM",
                        title: `Night Attraction Tour - Day ${day}`,
                        duration: "1h 45m",
                        type: "sight",
                        lat: 48.8529 + (day * 0.001),
                        lng: 2.3500 - (day * 0.001),
                    });
                }
            }

            let parsedStart = new Date();
            if (departureDate && departureDate !== "Select Date") {
                const parsed = new Date(departureDate);
                if (!isNaN(parsed.getTime())) {
                    parsedStart = parsed;
                }
            }
            
            let parsedEnd = new Date(parsedStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (returnDate) {
                const parsed = new Date(returnDate);
                if (!isNaN(parsed.getTime())) {
                    parsedEnd = parsed;
                }
            }

            const planData = {
                title: `${destination} Adventure`,
                destination,
                startDate: parsedStart.toISOString(),
                endDate: parsedEnd.toISOString(),
                budget: budget,
                activities: activities,
                status: 'upcoming' as const,
                details: {
                    travellers: { adults, children },
                    transport: transportMode,
                    travelClass,
                    departureDate,
                    departureTime,
                    returnDate,
                    tripPace,
                    selectedPreferences
                }
            };

            await PlansService.createPlan(planData);
            
            // Save to recent searches list for home tab!
            try {
                const stored = await SecureStore.getItemAsync('recentSearches');
                const searches = stored ? JSON.parse(stored) : [];
                const newSearch = { 
                    from: origin || 'LHR', 
                    to: destination || 'DPS', 
                    date: departureDate ? new Date(departureDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'
                };
                const updated = [newSearch, ...searches.filter((s: any) => s.from !== newSearch.from || s.to !== newSearch.to)].slice(0, 4);
                await SecureStore.setItemAsync('recentSearches', JSON.stringify(updated));
            } catch (e) {
                console.warn('Failed to append to recentSearches', e);
            }

            setIsGenerating(false);
            router.push("/feature/(home)/bookings");
        } catch (error) {
            toast.show("Plan creation failed", { type: "danger" });
            setIsGenerating(false);
        }
    };

    return {
        budget, setBudget,
        priority, setPriority,
        ecoFriendly, setEcoFriendly,
        accommodation, setAccommodation,
        isGenerating, setIsGenerating,
        genStep, setGenStep,
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
        // Advanced states
        tripPace, setTripPace,
        selectedPreferences, setSelectedPreferences
    };
}
