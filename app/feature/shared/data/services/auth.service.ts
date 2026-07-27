import * as SecureStore from 'expo-secure-store';
import api from '../api';

export const AuthService = {
    // Signup with PIN
    async register(name: string, email: string, pin: string) {
        console.log(`[AuthService] Initiating register for: ${email}`);
        const response = await api.post('auth/register', { name, email, pin });
        console.log(`[AuthService] Register Response:`, response.data);
        if (response.data.success) {
            await SecureStore.setItemAsync('userToken', response.data.token);
            await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
            return response.data.user;
        }
        throw new Error(response.data.message || 'Registration failed');
    },

    // Login with PIN
    async login(email: string, pin: string) {
        console.log(`[AuthService] Initiating login for: ${email}`);
        const response = await api.post('auth/login', { email, pin });
        console.log(`[AuthService] Login Response:`, response.data);
        if (response.data.success) {
            await SecureStore.setItemAsync('userToken', response.data.token);
            await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
            return response.data.user;
        }
        throw new Error(response.data.message || 'Login failed');
    },

    async logout() {
        console.log(`[AuthService] Log out triggered, clearing token`);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
    }
};
