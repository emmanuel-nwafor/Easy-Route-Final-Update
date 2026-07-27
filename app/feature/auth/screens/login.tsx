import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Platform,
} from "react-native";
import {
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../../shared/data/AuthContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [securePin, setSecurePin] = useState(true);
    
    const toast = useToast();
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !pin) {
            toast.show("Email and PIN are required", { type: "danger" });
            return;
        }

        if (pin.length < 6) {
            toast.show("PIN must be 6 digits", { type: "danger" });
            return;
        }
        
        try {
            await login(email, pin);
            router.replace("/feature/home");
            toast.show("Welcome back!", { type: "success" });
        } catch (err: any) {
            toast.show(err.message || "Login failed", { type: "danger" });
        }
    };

    const fadeInUp = (delay: number) => ({
        from: { opacity: 0, translateY: 20 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: 'timing', duration: 800, delay } as const,
    });

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: 'white' }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={20}
        >
            <StatusBar barStyle="dark-content" />
            
            <View className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-20 -mb-20 opacity-50" />

            <View className="px-6 pt-24 pb-12">
                <MotiView {...fadeInUp(100)}>
                    <Text style={{ fontSize: wp(8) }} className="font-[Outfit-Bold] text-slate-900">
                        Welcome Back,{"\n"}
                        <Text className="text-[#003580]">Voyager</Text>
                    </Text>
                    <Text style={{ fontSize: wp(4) }} className="font-[Outfit-Medium] text-slate-500 mt-2">
                        Enter your credentials to continue your journey.
                    </Text>
                </MotiView>

                <View className="mt-16 space-y-6">
                    <MotiView {...fadeInUp(200)}>
                        <View className="flex-row items-center border border-slate-100 bg-slate-50 rounded-2xl p-4">
                            <Ionicons name="mail-outline" size={20} color="#64748B" />
                            <TextInput
                                className="flex-1 ml-3 font-[Outfit-Medium] text-slate-900"
                                placeholder="Email Address"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </MotiView>

                    <MotiView {...fadeInUp(250)} className="mt-4">
                        <View className="flex-row items-center border border-slate-100 bg-slate-50 rounded-2xl p-4">
                            <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                            <TextInput
                                className="flex-1 ml-3 font-[Outfit-Medium] text-slate-900"
                                placeholder="Password (6-digit PIN)"
                                keyboardType="number-pad"
                                secureTextEntry={securePin}
                                maxLength={6}
                                value={pin}
                                onChangeText={setPin}
                                placeholderTextColor="#94A3B8"
                            />
                            <TouchableOpacity onPress={() => setSecurePin(!securePin)} className="p-1">
                                <Ionicons name={securePin ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </MotiView>

                    <MotiView {...fadeInUp(280)} className="items-end mt-2">
                        <TouchableOpacity onPress={() => toast.show("PIN reset instructions sent to email", { type: "info" })}>
                            <Text className="text-[#003580] font-[Outfit-Bold] text-xs">Forgot Password?</Text>
                        </TouchableOpacity>
                    </MotiView>

                    <MotiView {...fadeInUp(300)} className="mt-8">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleLogin}
                            disabled={isLoading}
                            className="bg-[#003580] py-5 rounded-2xl flex-row justify-center items-center shadow-blue-200"
                        >
                            <Text className="text-white font-[Outfit-Bold] text-lg ml-2">
                                {isLoading ? "Verifying..." : "Login"}
                            </Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>

                <MotiView {...fadeInUp(400)} className="mt-8 flex-row justify-center space-x-4">
                    <TouchableOpacity onPress={() => router.replace("/feature/auth/screens/signup")}>
                        <Text className="text-center font-[Outfit-Medium] text-slate-500">
                            New here? <Text className="text-[#003580] font-[Outfit-Bold]">Register</Text>
                        </Text>
                    </TouchableOpacity>
                </MotiView>
            </View>
        </KeyboardAwareScrollView>
    );
}