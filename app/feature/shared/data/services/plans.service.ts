import api from '../api';

export interface TravelPlan {
    id?: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    activities: any[];
    status?: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export const PlansService = {
    /**
     * Get all plans for the logged-in user
     */
    async getUserPlans() {
        console.log(`[PlansService] getUserPlans called`);
        const response = await api.get('plans');
        console.log(`[PlansService] getUserPlans Response:`, response.data);
        return response.data.data;
    },

    /**
     * Create a new plan
     */
    async createPlan(planData: TravelPlan) {
        console.log(`[PlansService] createPlan called with:`, planData);
        const response = await api.post('plans', planData);
        console.log(`[PlansService] createPlan Response:`, response.data);
        return response.data.data;
    },

    /**
     * Get a single plan by ID
     */
    async getPlanById(id: string) {
        console.log(`[PlansService] getPlanById called for ID: ${id}`);
        const response = await api.get(`plans/${id}`);
        console.log(`[PlansService] getPlanById Response:`, response.data);
        return response.data.data;
    },

    /**
     * Search for travel routes (Discovery)
     */
    async searchRoutes(params: { from: string; to: string; date?: string; type?: string }) {
        console.log(`[PlansService] searchRoutes called with params:`, params);
        const response = await api.get('discovery/search', { params });
        console.log(`[PlansService] searchRoutes Response:`, response.data);
        return response.data.data;
    },

    /**
     * Get all travel routes in the database
     */
    async getAllRoutes() {
        console.log(`[PlansService] getAllRoutes called`);
        const response = await api.get('discovery/all');
        console.log(`[PlansService] getAllRoutes Response:`, response.data);
        return response.data.data;
    },

    /**
     * Create a new booking for a route
     */
    async createBooking(planId: string, bookingData: any) {
        console.log(`[PlansService] createBooking for plan ID ${planId} with booking:`, bookingData);
        const response = await api.post(`plans/${planId}/bookings`, bookingData);
        console.log(`[PlansService] createBooking Response:`, response.data);
        return response.data.data;
    },

    /**
     * Get all bookings for the logged-in user
     */
    async getBookings() {
        console.log(`[PlansService] getBookings called`);
        const response = await api.get('bookings');
        console.log(`[PlansService] getBookings Response:`, response.data);
        return response.data.data;
    },

    /**
     * Place a direct booking (no planId needed — backend handles plan creation)
     */
    async placeBooking(data: {
        type: string;
        operator?: string;
        from: string;
        to: string;
        price?: string | number;
        departureTime?: string;
        duration?: string;
        travelClass?: string;
        seatNumber?: string;
    }) {
        console.log(`[PlansService] placeBooking direct called with data:`, data);
        const response = await api.post('bookings', data);
        console.log(`[PlansService] placeBooking Response:`, response.data);
        return response.data.data;
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string) {
        console.log(`[PlansService] cancelBooking called for booking ID: ${bookingId}`);
        const response = await api.put(`bookings/${bookingId}`, { status: 'cancelled' });
        console.log(`[PlansService] cancelBooking Response:`, response.data);
        return response.data.data;
    },

    /**
     * Delete a travel plan
     */
    async deletePlan(planId: string) {
        console.log(`[PlansService] deletePlan called for plan ID: ${planId}`);
        const response = await api.delete(`plans/${planId}`);
        console.log(`[PlansService] deletePlan Response:`, response.data);
        return response.data.data;
    }
};
