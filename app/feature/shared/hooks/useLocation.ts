import * as Location from 'expo-location';
import { useState, useEffect } from 'react';

export interface LocationData {
    latitude: number;
    longitude: number;
    city?: string;
    address?: string;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getLocation = async (): Promise<LocationData | null> => {
        setIsLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return null;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;

            // Reverse Geocoding to get city name (optional but nice)
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            const city = reverseGeocode[0]?.city || reverseGeocode[0]?.region || 'Current Location';

            const data: LocationData = {
                latitude,
                longitude,
                city,
                address: city
            };

            setLocation(data);
            return data;
        } catch (err: any) {
            setErrorMsg(err.message || 'Could not fetch location');
            return null;
        } finally {
            setIsLoading(false);
        }
    };


    return { location, errorMsg, isLoading, getLocation };
};
