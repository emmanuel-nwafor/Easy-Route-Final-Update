import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AuthService } from './services/auth.service';
import api from './api';
import { BACKEND_URL } from './envConfig';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    handle?: string;
    avatar?: string;
    phone?: string;
    uiMode?: 'simple' | 'advanced';
    pushToken?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    login: (email: string, pin: string) => Promise<void>;
    register: (name: string, email: string, pin: string) => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDarkMode, setIsDarkModeState] = useState(false);

    useEffect(() => {
        checkAuth();
        SecureStore.getItemAsync('isDarkMode').then(val => {
            if (val !== null) {
                setIsDarkModeState(val === 'true');
            }
        });
    }, []);

    const setIsDarkMode = async (val: boolean) => {
        setIsDarkModeState(val);
        await SecureStore.setItemAsync('isDarkMode', val ? 'true' : 'false');
    };

    const registerForPushNotifications = async (userToken: string) => {
        try {
            if (Constants.appOwnership === 'expo') {
                console.log('[PushNotifications] Bypassing registration: Remote push notifications are disabled in Expo Go on SDK 53+.');
                return;
            }
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#003580',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Push notifications permissions denied');
                return;
            }

            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
            let pushToken = '';
            try {
                // Fetch native device token (FCM token on Android, APNs token on iOS)
                const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
                pushToken = deviceTokenResult.data;
                console.log('Fetched native device FCM/APNs token successfully:', pushToken);
            } catch (err) {
                console.warn('Failed to fetch native device token, trying Expo push token fallback...', err);
                const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
                pushToken = tokenResult.data;
                console.log('Fetched fallback Expo Push Token successfully:', pushToken);
            }

            if (pushToken) {
                console.log('Push Token registered successfully:', pushToken);
                await api.put('/users/update-details', { pushToken });
            }
        } catch (error) {
            console.warn('registerForPushNotifications failed:', error);
        }
    };

    // Server-Sent Events (SSE) notification streaming hook
    useEffect(() => {
        let xhr: XMLHttpRequest | null = null;
        let isConnected = false;

        const connectSSE = () => {
            if (!token) return;

            const streamUrl = (BACKEND_URL || '').endsWith('/')
                ? `${BACKEND_URL}notifications/stream`
                : `${BACKEND_URL}/notifications/stream`;

            const client = new XMLHttpRequest();
            xhr = client;

            client.open('GET', streamUrl, true);
            client.setRequestHeader('Authorization', `Bearer ${token}`);
            client.setRequestHeader('Accept', 'text/event-stream');

            let lastLength = 0;
            client.onprogress = () => {
                const updates = client.responseText.substring(lastLength);
                lastLength = client.responseText.length;

                const lines = updates.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(trimmed.substring(6));
                            
                            // Trigger device local alert (will slide in since shouldShowAlert is true)
                            Notifications.scheduleNotificationAsync({
                                content: {
                                    title: eventData.title || 'EasyRoute Notification',
                                    body: eventData.message || '',
                                    sound: 'default',
                                    data: eventData
                                },
                                trigger: null,
                            });
                        } catch (e) {
                            console.error('Failed to parse SSE data stream:', e);
                        }
                    }
                }
            };

            client.onerror = () => {
                console.warn('SSE connection error. Retrying stream in 10s...');
                isConnected = false;
                setTimeout(() => {
                    if (token && !isConnected) connectSSE();
                }, 10000);
            };

            client.onloadend = () => {
                isConnected = false;
            };

            client.send();
            isConnected = true;
            console.log('SSE connection initialized.');
        };

        if (token) {
            connectSSE();
            registerForPushNotifications(token);
        }

        return () => {
            if (xhr) {
                xhr.abort();
            }
        };
    }, [token]);

    const checkAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            const storedUser = await SecureStore.getItemAsync('userData');
            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Failed to parse cached userData', e);
                    }
                }
                
                // Silently refresh profile details in background without blocking screen mount
                api.get('/users/me').then(response => {
                    if (response.data.success) {
                        setUser(response.data.data);
                        SecureStore.setItemAsync('userData', JSON.stringify(response.data.data));
                    }
                }).catch(err => {
                    console.warn('Silent profile fetch failed:', err);
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        logout();
                    }
                });
            }
        } catch (error) {
            console.error('Auth authentication check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, pin: string) => {
        setIsLoading(true);
        try {
            const userData = await AuthService.login(email, pin);
            setUser(userData);
            const newToken = await SecureStore.getItemAsync('userToken');
            setToken(newToken);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, pin: string) => {
        setIsLoading(true);
        try {
            const userData = await AuthService.register(name, email, pin);
            setUser(userData);
            const newToken = await SecureStore.getItemAsync('userToken');
            setToken(newToken);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (data: Partial<User>) => {
        try {
            const response = await api.put('/users/update-details', data);
            if (response.data.success) {
                setUser(response.data.data);
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data.data));
            }
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                isDarkMode,
                setIsDarkMode,
                login,
                register,
                updateUser,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
