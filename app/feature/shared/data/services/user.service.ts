import api from '../api';

export interface UserUpdateData {
    name?: string;
    email?: string;
    uiMode?: 'simple' | 'advanced';
    preferences?: {
        notifications?: boolean;
        darkMode?: boolean;
    };
}

export const UserService = {
    /**
     * Get details of the currently logged-in user
     */
    async getMe() {
        console.log(`[UserService] getMe called`);
        const response = await api.get('users/me');
        console.log(`[UserService] getMe Response:`, response.data);
        return response.data.data;
    },

    /**
     * Update user details (name, email, preferences)
     */
    async updateUserDetails(data: UserUpdateData) {
        console.log(`[UserService] updateUserDetails called with:`, data);
        const response = await api.put('users/update-details', data);
        console.log(`[UserService] updateUserDetails Response:`, response.data);
        return response.data.data;
    },

    /**
     * Upload user profile avatar
     */
    async uploadAvatar(formData: FormData) {
        console.log(`[UserService] uploadAvatar called`);
        const response = await api.post('users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(`[UserService] uploadAvatar Response:`, response.data);
        return response.data.data;
    },

    /**
     * Delete user profile account
     */
    async deleteUser(id: string) {
        console.log(`[UserService] deleteUser called for ID: ${id}`);
        const response = await api.delete(`users/${id}`);
        console.log(`[UserService] deleteUser Response:`, response.data);
        return response.data;
    }
};
