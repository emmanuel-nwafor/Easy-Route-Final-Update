import { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { PlansService } from "../app/feature/shared/data/services/plans.service";

export function useBookings() {
    const [activeTab, setActiveTab] = useState<"Tickets" | "Saved Journeys">("Tickets");
    const [plans, setPlans] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    // Re-fetch whenever the tab comes back into focus (e.g. after placing a booking)
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [plansData, bookingsData] = await Promise.all([
                PlansService.getUserPlans(),
                PlansService.getBookings()
            ]);
            setPlans(plansData ?? []);
            setBookings(bookingsData ?? []);
        } catch (error) {
            console.error("Failed to fetch bookings data:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeletePlan = async (id: string) => {
        try {
            await PlansService.deletePlan(id);
            toast.show("Journey deleted successfully", { type: "success" });
            fetchData();
        } catch (error) {
            toast.show("Failed to delete journey", { type: "danger" });
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const upcomingPlans = plans.filter(p => p.status === 'upcoming' || p.status === 'ongoing' || p.status === 'draft');
    const pastPlans = plans.filter(p => p.status === 'completed' || p.status === 'cancelled');

    return {
        activeTab,
        setActiveTab,
        plans,
        bookings,
        isLoading,
        refreshing,
        upcomingPlans,
        pastPlans,
        router,
        handleDeletePlan,
        onRefresh
    };
}
