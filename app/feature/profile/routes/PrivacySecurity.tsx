import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';

const SecurityItem = ({ icon, label, description, rightElement }: any) => (
    <View className="flex-row items-center justify-between py-5 border-b border-slate-50">
        <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center">
                <Ionicons name={icon} size={20} color="#003580" />
            </View>
            <View className="ml-4 flex-1">
                <Text style={{ fontSize: wp(3.8) }} className="font-[Outfit-Bold] text-slate-900">{label}</Text>
                <Text style={{ fontSize: wp(2.8) }} className="text-slate-400 font-[Outfit-Medium] mt-0.5">{description}</Text>
            </View>
        </View>
        {rightElement}
    </View>
);

export default function PrivacySecurity() {
    const router = useRouter();
    const [biometrics, setBiometrics] = useState(true);
    const [twoStep, setTwoStep] = useState(false);

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />
            
            <View className="pt-16 px-6 pb-6 bg-white rounded-b-3xl shadow-sm shadow-slate-100 flex-row items-center">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="p-2 bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900 ml-4">Privacy & Security</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="p-6">
                <Text className="font-[Outfit-Bold] text-slate-400 text-xs mb-4 uppercase tracking-wider ml-1">Authentication</Text>
                <View className="bg-white px-4 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 mb-8">
                    <SecurityItem 
                        icon="key-outline"
                        label="Change PIN"
                        description="Update your 6-digit access PIN"
                        rightElement={<Feather name="chevron-right" size={18} color="#CBD5E1" />}
                    />
                    <SecurityItem 
                        icon="finger-print-outline"
                        label="Biometric Login"
                        description="Use Face ID / Fingerprint"
                        rightElement={
                            <Switch 
                                value={biometrics} 
                                onValueChange={setBiometrics}
                                trackColor={{ false: "#E2E8F0", true: "#003580" }}
                            />
                        }
                    />
                    <SecurityItem 
                        icon="shield-outline"
                        label="Two-Step Verification"
                        description="Extra layer of protection"
                        rightElement={
                            <Switch 
                                value={twoStep} 
                                onValueChange={setTwoStep}
                                trackColor={{ false: "#E2E8F0", true: "#003580" }}
                            />
                        }
                        isLast
                    />
                </View>

                <Text className="font-[Outfit-Bold] text-slate-400 text-xs mb-4 uppercase tracking-wider ml-1">Legal & Privacy</Text>
                <View className="bg-white px-4 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 mb-8">
                    <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-slate-50">
                        <Text className="font-[Outfit-Bold] text-slate-800">Privacy Policy</Text>
                        <Feather name="external-link" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-5 border-b border-slate-50">
                        <Text className="font-[Outfit-Bold] text-slate-800">Data Sharing</Text>
                        <Feather name="chevron-right" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-5">
                        <Text className="font-[Outfit-Bold] text-red-500">Deactivate Account</Text>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View className="bg-orange-50 p-6 rounded-[30px] border border-orange-100 mt-4 flex-row items-center mb-10">
                    <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                        <Ionicons name="warning" size={20} color="white" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="font-[Outfit-Bold] text-orange-700">Security Recommendation</Text>
                        <Text className="text-orange-700/60 font-[Outfit-Medium] text-[11px] leading-4 mt-1">Enable Two-Step Verification to secure your travel funds and identity data.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
