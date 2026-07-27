import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import { Country, State, City } from 'country-state-city';

interface LocationSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (location: string) => void;
    title: string;
    onDetectLocation?: () => void;
    isDetecting?: boolean;
}

export default function LocationSelectionModal({ 
    visible, 
    onClose, 
    onSelect, 
    title,
    onDetectLocation,
    isDetecting
}: LocationSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [step, setStep] = useState<'country' | 'state' | 'city'>('country');
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedState, setSelectedState] = useState<any>(null);

    // Fetch and filter data based on current step
    const data = useMemo(() => {
        if (step === 'country') {
            const countries = Country.getAllCountries();
            return search 
                ? countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                : countries;
        } else if (step === 'state') {
            const states = State.getStatesOfCountry(selectedCountry?.isoCode);
            return search
                ? states.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
                : states;
        } else {
            const cities = City.getCitiesOfState(selectedCountry?.isoCode, selectedState?.isoCode);
            return search
                ? cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                : cities;
        }
    }, [search, step, selectedCountry, selectedState]);

    const handleSelect = (item: any) => {
        if (step === 'country') {
            setSelectedCountry(item);
            setStep('state');
            setSearch('');
        } else if (step === 'state') {
            setSelectedState(item);
            setStep('city');
            setSearch('');
        } else {
            onSelect(`${item.name}, ${selectedCountry.name}`);
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setStep('country');
        setSelectedCountry(null);
        setSelectedState(null);
        setSearch('');
        onClose();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            onPress={() => handleSelect(item)}
            className="flex-row items-center py-4 border-b border-slate-50"
        >
            <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center">
                <Ionicons 
                    name={step === 'country' ? 'earth-outline' : step === 'state' ? 'map-outline' : 'business-outline'} 
                    size={16} 
                    color="#003580" 
                />
            </View>
            <Text className="ml-4 font-[Outfit-Medium] text-slate-800 text-base">
                {step === 'country' ? `${item.flag} ${item.name}` : item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <AppModal visible={visible} onClose={resetAndClose} title={title}>
            {step === 'country' && onDetectLocation && (
                <TouchableOpacity 
                    onPress={onDetectLocation}
                    disabled={isDetecting}
                    className="flex-row items-center bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100"
                >
                    {isDetecting ? (
                        <ActivityIndicator size="small" color="#003580" />
                    ) : (
                        <Ionicons name="location" size={20} color="#003580" />
                    )}
                    <Text className="ml-3 font-[Outfit-Bold] text-[#003580]">Detect My Current City</Text>
                </TouchableOpacity>
            )}

            <View className="bg-slate-50 flex-row items-center px-4 py-3 rounded-2xl mb-4 border border-slate-100">
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput 
                    placeholder={`Search ${step}...`}
                    className="flex-1 ml-3 font-[Outfit-Medium] text-slate-900"
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                />
            </View>

            {step !== 'country' && (
                <TouchableOpacity 
                    onPress={() => setStep(step === 'city' ? 'state' : 'country')}
                    className="flex-row items-center mb-4"
                >
                    <Ionicons name="arrow-back" size={16} color="#003580" />
                    <Text className="ml-2 font-[Outfit-Bold] text-[#003580]">Back to {step === 'city' ? 'States' : 'Countries'}</Text>
                </TouchableOpacity>
            )}

            <FlatList 
                data={data}
                keyExtractor={(item, index) => (item.isoCode || item.name) + index}
                renderItem={renderItem}
                scrollEnabled={false}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                ListEmptyComponent={
                    <Text className="text-slate-400 font-[Outfit-Medium] text-center py-10">No results found.</Text>
                }
            />
        </AppModal>
    );
}
