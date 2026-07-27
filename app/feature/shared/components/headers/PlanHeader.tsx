import { Text, View } from "react-native";
import { MotiView } from "moti";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useAuth } from "../../data/AuthContext";

// Animation Variants from your Home style
const fadeInUp = (delay: number) => ({
    from: { opacity: 0, translateY: 20 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing', duration: 800, delay } as const,
});

export default function PlanHeader() {
    const { isDarkMode } = useAuth();
    return (
        <MotiView {...fadeInUp(100)} className="mt-14 mb-6">
            <Text style={{ fontSize: wp(7), color: isDarkMode ? '#F8FAFC' : '#0F172A' }} className="font-[Outfit-Bold]">
                Plan Your Journey
            </Text>
        </MotiView>
    );
}