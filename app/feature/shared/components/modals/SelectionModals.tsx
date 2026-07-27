import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import AppModal from './AppModal';
import { Calendar } from 'react-native-calendars';

// --- Date & Time Modal ---
export interface DateModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
}

export const DatePickerModal = ({ visible, onClose, onSelect }: DateModalProps) => {
    const today = new Date().toISOString().split('T')[0];
    const [selected, setSelected] = useState(today);

    return (
        <AppModal visible={visible} onClose={onClose} title="Select Departure">
            <Calendar
                current={today}
                minDate={today}
                onDayPress={day => {
                    setSelected(day.dateString);

                    const formatted = new Date(day.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    onSelect(formatted);
                    onClose();
                }}
                markedDates={{
                    [selected]: { selected: true, disableTouchEvent: true, selectedColor: '#003580' }
                }}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#003580',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#003580',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#003580',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#003580',
                    disabledArrowColor: '#d9e1e8',
                    monthTextColor: '#003580',
                    indicatorColor: '#003580',
                    textDayFontFamily: 'Outfit-Medium',
                    textMonthFontFamily: 'Outfit-Bold',
                    textDayHeaderFontFamily: 'Outfit-Medium',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12
                }}
            />
        </AppModal>
    );
};

// --- Travellers Modal ---
export interface TravellerModalProps {
    visible: boolean;
    onClose: () => void;
    adults: number;
    childrenCount: number;
    onUpdate: (type: 'adults' | 'children', val: number) => void;
}

export const TravellerModal = ({ visible, onClose, adults, childrenCount, onUpdate }: TravellerModalProps) => {
    const Counter = ({ label, value, type }: { label: string, value: number, type: 'adults' | 'children' }) => (
        <View className="flex-row items-center justify-between py-4 border-b border-slate-50">
            <Text className="font-[Outfit-Bold] text-slate-700 text-lg">{label}</Text>
            <View className="flex-row items-center bg-slate-50 rounded-2xl px-2 py-1">
                <TouchableOpacity
                    onPress={() => onUpdate(type, Math.max(0, value - 1))}
                    className="p-2"
                >
                    <Ionicons name="remove" size={24} color="#003580" />
                </TouchableOpacity>
                <Text className="mx-4 font-[Outfit-Bold] text-lg text-slate-900">{value}</Text>
                <TouchableOpacity
                    onPress={() => onUpdate(type, value + 1)}
                    className="p-2"
                >
                    <Ionicons name="add" size={24} color="#003580" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <AppModal visible={visible} onClose={onClose} title="Who's Travelling?">
            <Counter label="Adults (12+)" value={adults} type="adults" />
            <Counter label="Children (2-11)" value={childrenCount} type="children" />

            <TouchableOpacity
                onPress={onClose}
                className="bg-[#003580] py-4 rounded-2xl items-center mt-10 shadow-lg shadow-blue-900/20"
            >
                <Text className="text-white font-[Outfit-Bold] text-lg">Confirm Travellers</Text>
            </TouchableOpacity>
        </AppModal>
    );
};

// --- Transport Modal ---
export interface TransportModalProps {
    visible: boolean;
    onSelect: (mode: string) => void;
    currentMode: string;
    onClose: () => void;
}

export const TransportModal = ({ visible, onSelect, currentMode, onClose }: TransportModalProps) => {
    const modes = [
        { name: 'Flight', icon: 'plane' },
        { name: 'Train', icon: 'train' },
        { name: 'Bus', icon: 'bus' },
        { name: 'Car', icon: 'car' }
    ];

    return (
        <AppModal visible={visible} onClose={onClose} title="Preferred Transport">
            <View className="flex-row flex-wrap justify-between">
                {modes.map((m) => (
                    <TouchableOpacity
                        key={m.name}
                        onPress={() => { onSelect(m.name); onClose(); }}
                        style={{ width: '47%' }}
                        className={`items-center py-6 rounded-3xl mb-4 border-2 ${currentMode === m.name ? 'bg-blue-50 border-[#003580]' : 'bg-white border-slate-50'}`}
                    >
                        <FontAwesome5 name={m.icon} size={30} color={currentMode === m.name ? "#003580" : "#CBD5E1"} />
                        <Text className={`mt-3 font-[Outfit-Bold] ${currentMode === m.name ? 'text-[#003580]' : 'text-slate-400'}`}>{m.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </AppModal>
    );
};

// --- Time Picker Modal ---

export const TimePickerModal = ({ visible, onClose, onSelect }: { visible: boolean, onClose: () => void, onSelect: (time: string) => void }) => {
    const times = ["06:00 AM", "08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM", "10:00 PM"];

    return (
        <AppModal visible={visible} onClose={onClose} title="Select Time">
            <FlatList
                data={times}
                numColumns={3}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => { onSelect(item); onClose(); }}
                        style={{ width: wp(25) }}
                        className="bg-slate-50 p-3 rounded-xl m-1 items-center border border-slate-100"
                    >
                        <Text className="font-[Outfit-Bold] text-slate-700">{item}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </AppModal>
    );
};

// --- Travel Class Modal ---
export const TravelClassModal = ({ visible, onClose, onSelect, currentClass }: { visible: boolean, onClose: () => void, onSelect: (val: string) => void, currentClass: string }) => {
    const classes = [
        { name: 'Economy', icon: 'seat-recline-normal', desc: 'Standard comfort' },
        { name: 'Business', icon: 'briefcase', desc: 'Premium perks' },
        { name: 'First Class', icon: 'crown', desc: 'Luxury travel' }
    ];

    return (
        <AppModal visible={visible} onClose={onClose} title="Travel Class">
            {classes.map((c) => (
                <TouchableOpacity
                    key={c.name}
                    onPress={() => { onSelect(c.name); onClose(); }}
                    className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${currentClass === c.name ? 'bg-blue-50 border-[#003580]' : 'bg-white border-slate-50'}`}
                >
                    <View className={`w-12 h-12 rounded-xl items-center justify-center ${currentClass === c.name ? 'bg-[#003580]' : 'bg-slate-100'}`}>
                        <MaterialCommunityIcons name={c.icon as any} size={24} color={currentClass === c.name ? 'white' : '#94A3B8'} />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className={`font-[Outfit-Bold] text-lg ${currentClass === c.name ? 'text-[#003580]' : 'text-slate-900'}`}>{c.name}</Text>
                        <Text className="text-slate-400 font-[Outfit-Medium] text-xs">{c.desc}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </AppModal>
    );
};

