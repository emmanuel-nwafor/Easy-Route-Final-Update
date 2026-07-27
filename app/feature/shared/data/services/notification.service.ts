import api from '../api';
import { BACKEND_URL } from '../envConfig';

export interface NotificationItem {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'booking' | 'system' | 'alert';
    unread: boolean;
    createdAt: string;
}

export const NotificationService = {
    /**
     * Get all notifications for the logged-in user
     */
    async getUserNotifications() {
        console.log(`[NotificationService] getUserNotifications called`);
        const response = await api.get('notifications');
        console.log(`[NotificationService] getUserNotifications Response:`, response.data);
        return response.data.data;
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(id: string) {
        console.log(`[NotificationService] markAsRead called for ID: ${id}`);
        const response = await api.put(`notifications/${id}/read`);
        console.log(`[NotificationService] markAsRead Response:`, response.data);
        return response.data.data;
    },

    /**
     * Mark all notifications as read for the logged-in user
     */
    async markAllAsRead() {
        console.log(`[NotificationService] markAllAsRead called`);
        const response = await api.put('notifications/readall');
        console.log(`[NotificationService] markAllAsRead Response:`, response.data);
        return response.data;
    },

    /**
     * Helper to get the stream URL for real-time Server-Sent Events (SSE)
     * To be used in React Native with a library (like react-native-sse) or EventSource polyfill.
     */
    getStreamUrl(token: string) {
        const baseUrl = (BACKEND_URL || '').endsWith('/') ? (BACKEND_URL || '') : `${BACKEND_URL || ''}/`;
        const url = `${baseUrl}notifications/stream?token=${token}`;
        console.log(`[NotificationService] getStreamUrl generated: ${url}`);
        return url;
    }
};
