import React, { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Platform, Modal } from "react-native";
// import Modal from "react-native-modal";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from 'moti';

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function FilterModal({ isVisible, onClose }: FilterModalProps) {
    const [selectedTransport, setSelectedTransport] = useState("Flight");
    const [priority, setPriority] = useState("Cheapest");

    const transportModes = [
        { name: "Flight", icon: "airplane" },
        { name: "Train", icon: "train" },
        { name: "Bus", icon: "bus" },
        { name: "Car", icon: "car" },
    ];

    const priorities = ["Cheapest", "Fastest", "Comfort", "Eco-friendly"];

    return (
        <Modal
            visible={isVisible}
        >
            <View
                style={{ height: hp(75), borderTopLeftRadius: wp(10), borderTopRightRadius: wp(10) }}
                className="bg-white p-6 shadow-2xl"
            >
                {/* Grab Handle */}
                <View className="items-center mb-6">
                    <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </View>

                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900">
                        Filter Your Search
                    </Text>
                    <TouchableOpacity onPress={onClose} className="bg-slate-50 p-2 rounded-full">
                        <Ionicons name="close" size={wp(5)} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="space-y-8">

                    {/* Transport Mode Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: isVisible ? 1 : 0, translateY: isVisible ? 0 : 10 }}
                        transition={{ delay: 100 }}
                    >
                        <Text style={{ fontSize: wp(3.5) }} className="font-[Outfit-Bold] text-[#003580] uppercase tracking-widest mb-4">
                            Transport Mode
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {transportModes.map((mode) => (
                                <TouchableOpacity
                                    key={mode.name}
                                    onPress={() => setSelectedTransport(mode.name)}
                                    style={{ width: wp(20), height: hp(10) }}
                                    className={`rounded-2xl items-center justify-center border ${selectedTransport === mode.name
                                        ? "bg-[#003580] border-[#003580]"
                                        : "bg-white border-slate-100"
                                        }`}
                                >
                                    <Ionicons
                                        name={mode.icon as any}
                                        size={wp(5.5)}
                                        color={selectedTransport === mode.name ? "white" : "#94A3B8"}
                                    />
                                    <Text
                                        style={{ fontSize: wp(2.8) }}
                                        className={`mt-2 font-[Outfit-Bold] ${selectedTransport === mode.name ? "text-white" : "text-slate-400"
                                            }`}
                                    >
                                        {mode.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </MotiView>

                    {/* Trip Priority Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: isVisible ? 1 : 0, translateY: isVisible ? 0 : 10 }}
                        transition={{ delay: 200 }}
                    >
                        <Text style={{ fontSize: wp(3.5) }} className="font-[Outfit-Bold] text-[#003580] uppercase tracking-widest mb-4">
                            Trip Priority
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {priorities.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => setPriority(item)}
                                    className={`px-5 py-3 rounded-full border ${priority === item
                                        ? "bg-[#003580]/10 border-[#003580]"
                                        : "bg-white border-slate-100"
                                        }`}
                                >
                                    <Text
                                        style={{ fontSize: wp(3.2) }}
                                        className={`font-[Outfit-Bold] ${priority === item ? "text-[#003580]" : "text-slate-400"
                                            }`}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </MotiView>

                    {/* Placeholder for Budget/Toggle Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: isVisible ? 1 : 0, translateY: isVisible ? 0 : 10 }}
                        transition={{ delay: 300 }}
                    >
                        <Text style={{ fontSize: wp(3.5) }} className="font-[Outfit-Bold] text-[#003580] uppercase tracking-widest mb-4">
                            Accomodation Needed?
                        </Text>
                        <View className="bg-slate-50 p-4 rounded-2xl flex-row justify-between items-center">
                            <Text className="font-[Outfit-Medium] text-slate-700">Include hotel deals</Text>
                            <TouchableOpacity className="w-12 h-6 bg-[#003580] rounded-full justify-center px-1">
                                <View className="w-4 h-4 bg-white rounded-full self-end" />
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                </ScrollView>

                {/* Action Footer */}
                <View className="pt-6 border-t border-slate-50 flex-row gap-4">
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
                    >
                        <Text className="text-slate-600 font-[Outfit-Bold]">Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-[2] bg-[#003580] py-4 rounded-2xl items-center shadow-lg shadow-blue-900/20"
                    >
                        <Text className="text-white font-[Outfit-Bold]">Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}