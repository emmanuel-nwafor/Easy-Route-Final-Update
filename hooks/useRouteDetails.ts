import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { PlansService } from '../app/feature/shared/data/services/plans.service';
import { useAuth } from '../app/feature/shared/data/AuthContext';
import { FLIGHT_IMAGES, TRAIN_IMAGES, BUS_IMAGES } from '../constants';

export function useRouteDetails(routesStr: string) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const toast = useToast();
    const { user } = useAuth();

    const travelClass = typeof params.travelClass === 'string' ? params.travelClass : 'Economy';

    const [activeIndex, setActiveIndex] = useState(0);
    const [carouselImages, setCarouselImages] = useState<string[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [passengerName, setPassengerName] = useState(user?.name || '');
    const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
    const [seatPreference, setSeatPreference] = useState('Window');
    const [mealPreference, setMealPreference] = useState('Standard');
    const [specialAssistance, setSpecialAssistance] = useState(false);
    const [specialAssistanceType, setSpecialAssistanceType] = useState('');
    const [specialAssistanceEquipment, setSpecialAssistanceEquipment] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [hasInsurance, setHasInsurance] = useState(false);
    const [luggageCount, setLuggageCount] = useState(0);
    const [showDetailsForm, setShowDetailsForm] = useState(false);

    useEffect(() => {
        if (user) {
            if (!passengerName) setPassengerName(user.name || '');
            if (!passengerPhone) setPassengerPhone(user.phone || '');
        }
    }, [user]);

    let route: any = {};
    try {
        route = JSON.parse(routesStr);
    } catch (e) {
        console.error("Failed to parse route for details", e);
    }

    useEffect(() => {
        let baseImages = FLIGHT_IMAGES;
        if (route.type === 'train') baseImages = TRAIN_IMAGES;
        else if (route.type === 'bus') baseImages = BUS_IMAGES;

        // Randomize
        const shuffled = [...baseImages].sort(() => 0.5 - Math.random());
        setCarouselImages(shuffled.slice(0, 3));
    }, [routesStr]);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

    const handleBookNow = async () => {
        if (!showDetailsForm) {
            setShowDetailsForm(true);
            return;
        }

        if (!passengerName.trim()) {
            toast.show("Please enter passenger name", { type: "warning" });
            return;
        }

        setIsBooking(true);
        try {
            const booking = await PlansService.placeBooking({
                type: route.type || 'flight',
                operator: route.operator,
                from: route.from,
                to: route.to,
                price: route.price,
                duration: route.duration,
                seatNumber: seatPreference,
                travelClass: 'Economy', // Default to Economy
                luggageCount: luggageCount,
                hasInsurance: hasInsurance,
                details: JSON.stringify({
                    passengerName,
                    passengerPhone,
                    mealPreference,
                    specialAssistance,
                    specialAssistanceType,
                    specialAssistanceEquipment,
                    emergencyContactName,
                    emergencyContactPhone,
                    hasInsurance,
                    luggageCount
                })
            });
            toast.show('Booking confirmed! 🎉', { type: 'success' });
            setShowDetailsForm(false);
            router.push({
                pathname: '/feature/search/screens/booking-details',
                params: {
                    id: booking._id || booking.id,
                    type: booking.vehicleType || route.type,
                    operator: booking.operator || route.operator,
                    from: booking.departureLocation?.name || route.from,
                    to: booking.arrivalLocation?.name || route.to,
                    date: new Date(booking.departureTime).toLocaleDateString(),
                    time: new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    seat: booking.seatNumber || seatPreference,
                    travelClass: booking.travelClass || 'Economy',
                    status: booking.status || 'Confirmed',
                }
            });
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to place booking';
            toast.show(msg, { type: 'danger' });
        } finally {
            setIsBooking(false);
        }
    };

    const handleSaveJourney = async () => {
        setIsSaving(true);
        try {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            await PlansService.createPlan({
                title: `${route.from || 'Origin'} to ${route.to || 'Destination'} (${route.operator || 'Carrier'})`,
                destination: route.to || 'Destination',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                budget: route.price ? parseInt(route.price.toString().replace(/[^0-9]/g, '')) : 1000,
                activities: [
                    {
                        title: `${route.type || 'Travel'} via ${route.operator || 'Carrier'}`,
                        time: route.time || '10:00 AM',
                        location: route.from || 'Origin',
                        cost: route.price ? parseInt(route.price.toString().replace(/[^0-9]/g, '')) : 0
                    }
                ],
                status: 'upcoming'
            });
            toast.show('Journey saved successfully! ❤️', { type: 'success' });
            router.push('/feature/(home)/bookings');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to save journey';
            toast.show(msg, { type: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewInMap = () => {
        router.push({
            pathname: '/feature/search/screens/map-search',
            params: { routeData: JSON.stringify(route) }
        });
    };

    return {
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
    };
}
