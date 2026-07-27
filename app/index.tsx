import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StatusBar, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./feature/shared/data/AuthContext";
import * as SecureStore from 'expo-secure-store';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("@/assets/Outfit/static/Outfit-Regular.ttf"),
    "Outfit-Medium": require("@/assets/Outfit/static/Outfit-Medium.ttf"),
    "Outfit-Bold": require("@/assets/Outfit/static/Outfit-Bold.ttf"),
    "Outfit-Light": require("@/assets/Outfit/static/Outfit-Light.ttf"),
  });

  useEffect(() => {
    SecureStore.getItemAsync('hasSeenOnboarding').then((val) => {
      setHasSeenOnboarding(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isAuthLoading && hasSeenOnboarding !== null) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          if (isAuthenticated) {
            router.replace("/feature/home");
          } else if (hasSeenOnboarding) {
            router.replace("/feature/auth/screens/login");
          } else {
            router.replace("/feature/onboarding");
          }
        }, 800);
      });
    }
  }, [fontsLoaded, isAuthLoading, isAuthenticated, hasSeenOnboarding]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView className="items-center justify-center">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Animated.Image
            source={require("@/assets/images/logo.png")}
            style={{
              width: wp("45%"),
              height: wp("45%"),
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
