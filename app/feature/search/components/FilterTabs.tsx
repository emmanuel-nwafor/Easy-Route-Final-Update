import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const filters = [
    { id: 1, label: 'Best Match', icon: 'star', color: '#EAB308', active: true },
    { id: 2, label: 'Cheapest', icon: 'thermometer-low', color: '#94A3B8', active: false },
    { id: 3, label: 'Fastest', icon: 'flash', color: '#94A3B8', active: false },
];

export default function FilterTabs() {
    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 10, paddingBottom: 15 }}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${filter.active ? 'bg-[#003580] border-[#003580]' : 'bg-white border-slate-100'}`}
                    >
                        <MaterialCommunityIcons name={filter.icon as any} size={16} color={filter.active ? 'white' : filter.color} />
                        <Text
                            style={{ fontSize: wp(3.2) }}
                            className={`ml-2 font-[Outfit-Bold] ${filter.active ? 'text-white' : 'text-slate-500'}`}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}