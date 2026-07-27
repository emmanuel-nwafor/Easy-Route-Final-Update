import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Image,
    Platform,
    ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../shared/data/AuthContext';
import { useToast } from 'react-native-toast-notifications';

export default function PersonalInformation() {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`);
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const toast = useToast();
    const router = useRouter();

    const handleChangeAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            toast.show("Permission to access gallery is required", { type: "danger" });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const fileName = imageUri.split('/').pop() || 'avatar.jpg';
            const fileType = result.assets[0].mimeType || 'image/jpeg';

            setIsUploadingImage(true);
            toast.show("Uploading image securely...", { type: "info" });

            try {
                // Prepare FormData for the backend Multer endpoint
                const formData = new FormData();
                formData.append('avatar', {
                    uri: imageUri,
                    name: fileName,
                    type: fileType,
                } as any);

                // Use the configured api service from your environment
                const api = require('../../shared/data/api').default;

                const response = await api.post('/users/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success && response.data.data.avatar) {
                    setAvatar(response.data.data.avatar);
                    updateUser({ avatar: response.data.data.avatar }); // Update local context
                    toast.show("Avatar uploaded via backend!", { type: "success" });
                } else {
                    toast.show("Failed to secure image link", { type: "danger" });
                    setAvatar(imageUri); // local fallback
                }
            } catch (err) {
                console.error("Backend Upload Error:", err);
                toast.show("Failed to upload image. Server error.", { type: "danger" });
                setAvatar(imageUri); // local fallback
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleSave = async () => {
        if (!name) {
            toast.show("Name cannot be empty", { type: "warning" });
            return;
        }

        setIsSaving(true);
        try {
            await updateUser({ name, phone, avatar });
            toast.show("Profile updated", { type: "success" });
            router.back();
        } catch (error) {
            toast.show("Update failed", { type: "danger" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View
                style={{ paddingTop: hp(7), height: hp(15) }}
                className="bg-white px-6 pb-4 rounded-b-[30px] flex-row items-center justify-between border-b border-slate-100"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2.5 bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={{ fontSize: wp(4.8) }} className="font-[Outfit-Bold] text-slate-900">
                    Personal Info
                </Text>
                <View className="w-10" />
            </View>

            {/* Scrollable Content */}
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: wp(6), paddingTop: hp(3), paddingBottom: hp(15) }}
                extraScrollHeight={20}
                enableOnAndroid={true}
            >
                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <Image
                            source={{ uri: avatar }}
                            style={{ width: wp(30), height: wp(30) }}
                            className={`rounded-full border-4 border-white ${isUploadingImage ? 'opacity-50' : 'opacity-100'}`}
                        />
                        {isUploadingImage && (
                            <View className="absolute inset-0 items-center justify-center">
                                <ActivityIndicator size="small" color="#003580" />
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={handleChangeAvatar}
                            activeOpacity={0.8}
                            disabled={isUploadingImage}
                            className="absolute bottom-0 right-0 bg-[#003580] p-2.5 rounded-full border-4 border-[#F8FAFC]"
                        >
                            <Ionicons name="camera" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View className="space-y-5">
                    <View>
                        <Text className="text-slate-400 font-[Outfit-Medium] mb-2 ml-1 text-[10px] tracking-widest">FULL NAME</Text>
                        <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-slate-200">
                            <Feather name="user" size={18} color="#94A3B8" className="mr-3" />
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="flex-1 font-[Outfit-Bold] text-slate-900 text-base"
                            />
                        </View>
                    </View>

                    <View>
                        <View className="flex-row justify-between mb-2 px-1">
                            <Text className="text-slate-400 font-[Outfit-Medium] text-[10px] tracking-widest">EMAIL ADDRESS</Text>
                            <Text className="text-slate-300 font-[Outfit-Medium] text-[9px]">LOCKED</Text>
                        </View>
                        <View className="bg-slate-100 flex-row items-center px-4 h-14 rounded-2xl border border-slate-200">
                            <Feather name="mail" size={18} color="#CBD5E1" className="mr-3" />
                            <TextInput
                                value={email}
                                editable={false}
                                className="flex-1 font-[Outfit-Bold] text-slate-400 text-base"
                            />
                            <Ionicons name="lock-closed" size={16} color="#CBD5E1" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-slate-400 font-[Outfit-Medium] mb-2 ml-1 text-[10px] tracking-widest">PHONE NUMBER</Text>
                        <View className="bg-white flex-row items-center px-4 h-14 rounded-2xl border border-slate-200">
                            <Feather name="phone" size={18} color="#94A3B8" className="mr-3" />
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                className="flex-1 font-[Outfit-Bold] text-slate-900 text-base"
                            />
                        </View>
                    </View>

                    {/* Info Card */}
                    <View className="mb-20 bg-sky-50 p-5 rounded-3xl flex-row items-center border border-sky-100 mt-2">
                        <View className="w-11 h-11 bg-[#003580] rounded-xl items-center justify-center">
                            <MaterialCommunityIcons name="shield-check" size={24} color="white" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-[Outfit-Bold] text-[#003580] text-sm">Verified Identity</Text>
                            <Text className="text-sky-700 font-[Outfit-Medium] text-[10px] leading-4">
                                Your account is legally verified for global travel.
                            </Text>
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* Fixed CTA Button Container */}
            <View className="absolute bottom-14 left-0 right-0 bg-white/80 px-6 pt-4 pb-15 border-t border-slate-50">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.8}
                    className="bg-[#003580] h-16 rounded-2xl items-center justify-center"
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="darkgreen" />
                    ) : (
                        <Text style={{ fontSize: wp(4.5) }} className="text-white font-[Outfit-Bold]">
                            Update Profile
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}