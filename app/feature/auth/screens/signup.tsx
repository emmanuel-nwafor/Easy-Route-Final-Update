import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
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

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [securePin, setSecurePin] = useState(true);
    const [secureConfirmPin, setSecureConfirmPin] = useState(true);
    
    const toast = useToast();
    const { register, isLoading } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !email || !pin || !confirmPin) {
            toast.show("All fields are required", { type: "danger" });
            return;
        }

        if (!email.includes("@")) {
            toast.show("Please enter a valid email address", { type: "danger" });
            return;
        }

        if (pin.length < 6) {
            toast.show("Password/PIN must be 6 digits", { type: "danger" });
            return;
        }

        if (pin !== confirmPin) {
            toast.show("Passwords do not match", { type: "danger" });
            return;
        }
        
        try {
            await register(name, email, pin);
            router.replace("/feature/home");
            toast.show("Account created successfully", { type: "success" });
        } catch (err: any) {
            toast.show(err.message || "Registration failed", { type: "danger" });
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
            
            <View className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 opacity-50" />

            <View className="px-6 pt-20 pb-12">
                <MotiView {...fadeInUp(100)}>
                    <Text style={{ fontSize: wp(8) }} className="font-[Outfit-Bold] text-slate-900">
                        Create your{"\n"}
                        <Text className="text-[#003580]">Account</Text>
                    </Text>
                    <Text style={{ fontSize: wp(4) }} className="font-[Outfit-Medium] text-slate-500 mt-2">
                        Fill in the details below to start planning routes.
                    </Text>
                </MotiView>

                <View className="mt-10 space-y-4">
                    <MotiView {...fadeInUp(150)}>
                        <View className="flex-row items-center border border-slate-100 bg-slate-50 rounded-2xl p-4">
                            <Ionicons name="person-outline" size={20} color="#64748B" />
                            <TextInput
                                className="flex-1 ml-3 font-[Outfit-Medium] text-slate-900"
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </MotiView>

                    <MotiView {...fadeInUp(200)} className="mt-4">
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

                    <MotiView {...fadeInUp(300)} className="mt-4">
                        <View className="flex-row items-center border border-slate-100 bg-slate-50 rounded-2xl p-4">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#64748B" />
                            <TextInput
                                className="flex-1 ml-3 font-[Outfit-Medium] text-slate-900"
                                placeholder="Confirm Password"
                                keyboardType="number-pad"
                                secureTextEntry={secureConfirmPin}
                                maxLength={6}
                                value={confirmPin}
                                onChangeText={setConfirmPin}
                                placeholderTextColor="#94A3B8"
                            />
                            <TouchableOpacity onPress={() => setSecureConfirmPin(!secureConfirmPin)} className="p-1">
                                <Ionicons name={secureConfirmPin ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </MotiView>

                    <MotiView {...fadeInUp(350)} className="mt-10">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleSignup}
                            disabled={isLoading}
                            className="bg-[#003580] py-5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-blue-200"
                        >
                            <Text className="text-white font-[Outfit-Bold] text-lg ml-2">
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>

                <MotiView {...fadeInUp(400)} className="mt-8">
                    <TouchableOpacity onPress={() => router.replace("/feature/auth/screens/login")}>
                        <Text className="text-center font-[Outfit-Medium] text-slate-500">
                            Already have an account? <Text className="text-[#003580] font-[Outfit-Bold]">Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </MotiView>
            </View>
        </KeyboardAwareScrollView>
    );
}