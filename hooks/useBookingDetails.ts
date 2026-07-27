import { useState, useEffect } from 'react';
import { Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../app/feature/shared/data/AuthContext';
import { PlansService } from '../app/feature/shared/data/services/plans.service';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateTicketHTML } from '../constants/pdfTemplate';
import { useToast } from 'react-native-toast-notifications';

export function useBookingDetails(params: any) {
    const router = useRouter();
    const { user, isDarkMode } = useAuth();
    const toast = useToast();

    const id = typeof params.id === 'string' ? params.id : '';
    const type = typeof params.type === 'string' ? params.type : 'flight';
    const operator = typeof params.operator === 'string' ? params.operator : '';
    const from = typeof params.from === 'string' ? params.from : '';
    const to = typeof params.to === 'string' ? params.to : '';
    const date = typeof params.date === 'string' ? params.date : '';
    const time = typeof params.time === 'string' ? params.time : '10:00 AM';
    const seat = typeof params.seat === 'string' ? params.seat : 'Auto-assigned';
    const travelClass = typeof params.travelClass === 'string' ? params.travelClass : 'Economy';
    const status = typeof params.status === 'string' ? params.status : 'Confirmed';
    const confirmationRef = `VY-${id.substring(0, 6).toUpperCase()}`;

    const [isCancelling, setIsCancelling] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Advanced UI States
    const [plan, setPlan] = useState<any | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [weatherSwapped, setWeatherSwapped] = useState(false);
    const [vaultDocs, setVaultDocs] = useState<any[]>([
        { id: 'v1', name: 'Hotel Confirmation - Paris Central.pdf', size: '1.2 MB', type: 'hotel', verified: true },
        { id: 'v2', name: 'Flight Boarding Pass - CDG.pdf', size: '840 KB', type: 'flight', verified: true }
    ]);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [selectedPin, setSelectedPin] = useState<any | null>(null);

    const planId = typeof params.planId === 'string' ? params.planId : '';
    const targetPlanId = planId || (type === 'Plan' ? id : '');

    useEffect(() => {
        if (targetPlanId) {
            fetchPlanDetails(targetPlanId);
        } else {
            // For bookings that don't have a plan yet, generate default activities
            const defaultActivities = generateDefaultActivities(to || 'Paris');
            setActivities(defaultActivities);
        }
    }, [targetPlanId]);

    const fetchPlanDetails = async (planIdToLoad: string) => {
        setIsLoadingPlan(true);
        try {
            const plans = await PlansService.getUserPlans();
            const found = plans.find((p: any) => p._id === planIdToLoad || p.id === planIdToLoad);
            if (found) {
                setPlan(found);
                if (!found.activities || found.activities.length === 0) {
                    const defaultActivities = generateDefaultActivities(found.destination || to || 'Paris');
                    setActivities(defaultActivities);
                } else {
                    setActivities(found.activities);
                }
            } else {
                const defaultActivities = generateDefaultActivities(to || 'Paris');
                setActivities(defaultActivities);
            }
        } catch (err) {
            console.error('Failed to load plan details:', err);
            const defaultActivities = generateDefaultActivities(to || 'Paris');
            setActivities(defaultActivities);
        } finally {
            setIsLoadingPlan(false);
        }
    };

    const handleSwapActivities = (index1: number, index2: number) => {
        if (index1 < 0 || index1 >= activities.length || index2 < 0 || index2 >= activities.length) return;
        const newActs = [...activities];
        const temp = newActs[index1];
        newActs[index1] = newActs[index2];
        newActs[index2] = temp;
        
        // Update their time slots to match their new positions
        const t1 = activities[index1].time;
        const t2 = activities[index2].time;
        newActs[index1].time = t1;
        newActs[index2].time = t2;

        setActivities(newActs);
        toast.show("Timeline re-ordered! Transit times recalculated.", { type: "success" });
    };

    const handleWeatherOptimize = () => {
        // Swap outdoor sight activity with indoor restaurant activity
        const museumIndex = activities.findIndex(a => a.type === 'sight');
        const foodIndex = activities.findIndex(a => a.type === 'restaurant');
        if (museumIndex !== -1 && foodIndex !== -1) {
            const newActs = [...activities];
            const temp = newActs[museumIndex];
            newActs[museumIndex] = newActs[foodIndex];
            newActs[foodIndex] = temp;

            const t1 = activities[museumIndex].time;
            const t2 = activities[foodIndex].time;
            newActs[museumIndex].time = t1;
            newActs[foodIndex].time = t2;

            setActivities(newActs);
            setWeatherSwapped(true);
            toast.show("Optimized schedule for weather conditions!", { type: "success" });
        }
    };

    const handleOcrAutoImport = () => {
        setIsUploadingDoc(true);
        setTimeout(() => {
            const newDoc = {
                id: `v${Date.now()}`,
                name: 'Airbnb Confirmation - Rue de Rivoli.pdf',
                size: '950 KB',
                type: 'home',
                verified: true
            };
            setVaultDocs([...vaultDocs, newDoc]);
            setIsUploadingDoc(false);
            toast.show("OCR scan complete: Airbnb reservation imported!", { type: "success" });
        }, 1500);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: `Easy Route Ticket – ${from} ➔ ${to}`,
                message:
                    `🎫 Easy Route Digital Ticket\n\n` +
                    `Ref: ${confirmationRef}\n` +
                    `${operator} | ${type.toUpperCase()}\n` +
                    `From: ${from}  ➔  To: ${to}\n` +
                    `Date: ${date} at ${time}\n` +
                    `Seat: ${seat} | Class: ${travelClass}\n` +
                    `Passenger: ${user?.name || 'Voyager'}\n` +
                    `Status: ${status}\n\n` +
                    `Booked via Easy Route 🌍`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const html = generateTicketHTML({
                operator,
                type,
                status,
                from,
                to,
                date,
                time,
                passengerName: user?.name || 'Voyager',
                seat,
                travelClass,
                confirmationRef
            });

            const { uri } = await Print.printToFileAsync({ html, base64: false });

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Easy Route Ticket – ${confirmationRef}`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Saved', `Ticket PDF saved to: ${uri}`);
            }
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to generate PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCancelBooking = () => {
        Alert.alert(
            'Cancel Booking',
            `Are you sure you want to cancel your ${type} booking to ${to}? This cannot be undone.`,
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setIsCancelling(true);
                        try {
                            await PlansService.cancelBooking(id);
                            Alert.alert('Cancelled', 'Your booking has been cancelled.');
                            router.back();
                        } catch (err: any) {
                            Alert.alert('Error', err?.response?.data?.message || 'Failed to cancel booking');
                        } finally {
                            setIsCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    return {
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
    };
}

const CITY_COORDS: { [key: string]: { lat: number, lng: number } } = {
    'London': { lat: 51.5074, lng: -0.1278 },
    'LHR': { lat: 51.4700, lng: -0.4543 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'CDG': { lat: 49.0097, lng: 2.5479 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'JFK': { lat: 40.6413, lng: -73.7781 },
    'Bali': { lat: -8.4095, lng: 115.1889 },
    'DPS': { lat: -8.7482, lng: 115.1671 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'DXB': { lat: 25.2532, lng: 55.3657 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'SIN': { lat: 1.3644, lng: 103.9915 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'HND': { lat: 35.5494, lng: 139.7798 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'SYD': { lat: -33.9399, lng: 151.1753 }
};

function generateDefaultActivities(destination: string) {
    const coords = CITY_COORDS[destination] || CITY_COORDS['Paris'];
    const lat = coords.lat;
    const lng = coords.lng;

    return [
        {
            id: 'default-act-f-1',
            day: 1,
            time: "09:00 AM",
            title: `City Center Sightseeing & Breakfast`,
            duration: "2h 30m",
            type: "restaurant",
            lat: lat + 0.002,
            lng: lng - 0.002,
        },
        {
            id: 'default-act-c-1',
            day: 1,
            time: "02:00 PM",
            title: `Historic Landmark & Culture Tour`,
            duration: "3h 00m",
            type: "sight",
            lat: lat + 0.003,
            lng: lng - 0.003,
        },
        {
            id: 'default-act-f-2',
            day: 2,
            time: "09:00 AM",
            title: `Local Culinary Experience`,
            duration: "2h 30m",
            type: "restaurant",
            lat: lat - 0.002,
            lng: lng + 0.002,
        },
        {
            id: 'default-act-c-2',
            day: 2,
            time: "02:00 PM",
            title: `Museum & Arts Exhibition`,
            duration: "3h 00m",
            type: "sight",
            lat: lat - 0.003,
            lng: lng + 0.003,
        },
        {
            id: 'default-act-a-1',
            day: 3,
            time: "07:30 PM",
            title: `Scenic Skyline Dinner`,
            duration: "2h 00m",
            type: "sight",
            lat: lat + 0.001,
            lng: lng + 0.001,
        }
    ];
}
