import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { NotificationService } from '../../shared/data/services/notification.service';

const getIcon = (type: string) => {
    switch (type) {
        case 'discovery': return { name: 'sparkles', color: '#3B82F6', bg: '#EFF6FF' };
        case 'booking': return { name: 'calendar', color: '#10B981', bg: '#ECFDF5' };
        case 'security': return { name: 'shield-checkmark', color: '#F59E0B', bg: '#FFFBEB' };
        default: return { name: 'settings-outline', color: '#64748B', bg: '#F8FAFC' };
    }
};

const formatTime = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString() + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

export default function NotificationsScreen() {
    const router = useRouter();
    const toast = useToast();
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [error, setError] = React.useState('');

    const fetchNotifications = async (silent = false) => {
        if (!silent) setIsLoading(true);
        setError('');
        try {
            const data = await NotificationService.getUserNotifications();
            setNotifications(data ?? []);
            // Mark all as read in background — don't block UI
            NotificationService.markAllAsRead().catch(() => {});
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Unknown error';
            console.error('Notification fetch error:', msg);
            setError('Failed to load notifications. Pull to retry.');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications(true);
    };

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="pt-16 px-6 pb-6 bg-white rounded-b-3xl shadow-sm shadow-slate-100 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 bg-slate-50 rounded-full"
                >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={{ fontSize: wp(5.5) }} className="font-[Outfit-Bold] text-slate-900">Notifications</Text>
                <TouchableOpacity onPress={() => fetchNotifications()} className="p-2 bg-slate-50 rounded-full">
                    <Ionicons name="refresh" size={20} color="#003580" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#003580" />
                }
            >
                {isLoading ? (
                    <View className="items-center py-16">
                        <ActivityIndicator size="large" color="#003580" />
                        <Text className="text-slate-400 font-[Outfit-Medium] mt-4">Loading notifications...</Text>
                    </View>
                ) : error ? (
                    <View className="items-center py-16">
                        <Ionicons name="cloud-offline-outline" size={50} color="#CBD5E1" />
                        <Text className="text-slate-500 font-[Outfit-Medium] mt-4 text-center px-6">{error}</Text>
                        <TouchableOpacity
                            onPress={() => fetchNotifications()}
                            className="mt-6 bg-[#003580] px-8 py-3 rounded-2xl"
                        >
                            <Text className="text-white font-[Outfit-Bold]">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="items-center py-20">
                        <Ionicons name="notifications-off-outline" size={50} color="#CBD5E1" />
                        <Text className="text-slate-400 font-[Outfit-Medium] mt-4">You have no notifications yet</Text>
                    </View>
                ) : (
                    notifications.map((item, idx) => {
                        const icon = getIcon(item.type);
                        return (
                            <MotiView
                                key={item._id ?? idx}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ delay: idx * 80, type: 'timing' }}
                                className={`bg-white p-4 rounded-3xl mb-4 border ${item.unread ? 'border-blue-100' : 'border-slate-50'} shadow-sm shadow-slate-100 flex-row`}
                            >
                                <View
                                    style={{ backgroundColor: icon.bg }}
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                >
                                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
                                </View>

                                <View className="ml-4 flex-1">
                                    <Text style={{ fontSize: wp(4) }} className="font-[Outfit-Bold] text-slate-900">
                                        {item.title}
                                    </Text>
                                    <Text style={{ fontSize: wp(3.4) }} className="text-slate-500 font-[Outfit-Medium] mt-1 leading-5">
                                        {item.message}
                                    </Text>
                                    <Text style={{ fontSize: wp(2.8) }} className="text-slate-400 font-[Outfit-Medium] mt-2">
                                        {formatTime(item.createdAt)}
                                    </Text>
                                </View>

                                {item.unread && (
                                    <View className="w-2 h-2 bg-blue-500 rounded-full absolute top-5 right-5" />
                                )}
                            </MotiView>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}
