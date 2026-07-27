import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';
import {
  Animated,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  TouchableWithoutFeedback,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

interface Slide {
  id: string;
  title: string;
  description: string;
  image: any;
  image2: any;
  image3: any;
  backgroundColor: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Master your\nbudget",
    description: "Track every expense and pay your way—from traditional credit to modern crypto.",
    image: require("@/assets/images/Airport-with-chair.jpg"),
    image2: require("@/assets/images/Essential-Travel.jpg"),
    image3: require("@/assets/images/Explore-World.jpg"),
    backgroundColor: "#FDF2E9",
  },
  {
    id: "2",
    title: "Stress-free\nlogistics",
    description: "We handle the heavy lifting. Your tickets, transfers, and stays are perfectly synced.",
    image: require("@/assets/images/Zimtown-Luggage.jpg"),
    image2: require("@/assets/images/Family-traveling.jpg"),
    image3: require("@/assets/images/Airport-with-chair.jpg"),
    backgroundColor: "#E0F2F1",
  },
  {
    id: "3",
    title: "Pure\nenjoyment",
    description: "Stop searching and start experiencing. Curated gems for the modern explorer.",
    image: require("@/assets/images/Explore-World.jpg"),
    image2: require("@/assets/images/Essential-Travel.jpg"),
    image3: require("@/assets/images/Zimtown-Luggage.jpg"),
    backgroundColor: "#FFF9C4",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topCard, setTopCard] = useState(1);

    const card1Scale = useRef(new Animated.Value(1)).current;
    const card2Scale = useRef(new Animated.Value(1)).current;
    const card3Scale = useRef(new Animated.Value(1)).current;
    const scrollX = useRef(new Animated.Value(0)).current;

    const slidesRef = useRef<FlatList>(null);

    const springConfig = {
        tension: 15,
        friction: 6,
        useNativeDriver: false,
    };

    const handleCardPress = (cardId: number) => {
        setTopCard(cardId);
        Animated.parallel([
            Animated.spring(card1Scale, { toValue: cardId === 1 ? 1 : 0.92, ...springConfig }),
            Animated.spring(card2Scale, { toValue: cardId === 2 ? 1.1 : 1, ...springConfig }),
            Animated.spring(card3Scale, { toValue: cardId === 3 ? 1.1 : 1, ...springConfig }),
        ]).start();
    };

    useEffect(() => {
        handleCardPress(1);
    }, [currentIndex]);

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const finishOnboarding = async () => {
        await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
        router.replace("/feature/auth/screens/login");
    };

    const scrollToNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const skip = () => finishOnboarding();

    const backgroundColor = scrollX.interpolate({
        inputRange: SLIDES.map((_, i) => i * wp("100%")),
        outputRange: SLIDES.map((s) => s.backgroundColor),
    });

    return (
        <Animated.View style={{ flex: 1, backgroundColor }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" />
            <SafeAreaView style={{ flex: 1 }}>
                <Animated.FlatList
                    data={SLIDES}
                    ref={slidesRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => {
                        const inputRange = [(index - 1) * wp("100%"), index * wp("100%"), (index + 1) * wp("100%")];

                        const sub1TranslateX = scrollX.interpolate({
                            inputRange,
                            outputRange: [0, wp("-22%"), 0],
                        });
                        const sub1Rotate = scrollX.interpolate({
                            inputRange,
                            outputRange: ["0deg", "-12deg", "0deg"],
                        });

                        const sub2TranslateX = scrollX.interpolate({
                            inputRange,
                            outputRange: [0, wp("22%"), 0],
                        });
                        const sub2Rotate = scrollX.interpolate({
                            inputRange,
                            outputRange: ["0deg", "12deg", "0deg"],
                        });

                        const slideOpacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0, 1, 0],
                            extrapolate: "clamp",
                        });

                        return (
                            <View style={{ width: wp("100%"), paddingHorizontal: wp("10%") }} className="justify-between py-12">
                                <Animated.View style={{ height: hp("42%"), opacity: slideOpacity, position: "relative" }} className="justify-center items-center">
                                    <TouchableWithoutFeedback onPress={() => handleCardPress(2)}>
                    <Animated.Image
                      source={item.image2}
                      style={{
                        width: wp("45%"),
                        height: wp("60%"),
                        position: "absolute",
                        borderRadius: wp("5%"),
                        zIndex: topCard === 2 ? 30 : 8,
                        transform: [
                          { translateX: sub1TranslateX },
                          { rotate: sub1Rotate },
                          { scale: card2Scale }
                        ],
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>

                  {/* Right Card */}
                  <TouchableWithoutFeedback onPress={() => handleCardPress(3)}>
                    <Animated.Image
                      source={item.image3}
                      style={{
                        width: wp("45%"),
                        height: wp("60%"),
                        position: "absolute",
                        borderRadius: wp("5%"),
                        zIndex: topCard === 3 ? 30 : 8,
                        transform: [
                          { translateX: sub2TranslateX },
                          { rotate: sub2Rotate },
                          { scale: card3Scale }
                        ],
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>

                  {/* Main Card */}
                  <TouchableWithoutFeedback onPress={() => handleCardPress(1)}>
                    <Animated.Image
                      source={item.image}
                      style={{
                        width: wp("58%"),
                        height: wp("75%"),
                        zIndex: topCard === 1 ? 20 : 9,
                        borderRadius: wp("6%"),
                        borderWidth: 2,
                        borderColor: "white",
                        transform: [{ scale: card1Scale }],
                      }}
                      resizeMode="cover"
                    />
                  </TouchableWithoutFeedback>
                </Animated.View>

                <Animated.View style={{ opacity: slideOpacity }}>
                  <Text style={{ fontFamily: "Outfit-Bold", fontSize: hp("4.5%"), lineHeight: hp("5.5%") }} className="text-slate-900 text-left">
                    {item.title}
                  </Text>
                  <Text style={{ fontFamily: "Outfit-Regular", fontSize: hp("2.2%") }} className="text-slate-800 text-left mt-4 leading-7 opacity-60">
                    {item.description}
                  </Text>
                </Animated.View>

                <View style={{ height: hp("8%") }} />
              </View>
            );
          }}
        />

        <View style={{ bottom: hp("6%"), paddingHorizontal: wp("10%") }} className="absolute w-full flex-row justify-between items-center">
          <View className="flex-row items-center">
            {SLIDES.map((_, i) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [(i - 1) * wp("100%"), i * wp("100%"), (i + 1) * wp("100%")],
                outputRange: [8, 22, 8],
                extrapolate: "clamp",
              });
              return (
                <Animated.View key={i} style={{ width: dotWidth, backgroundColor: "black" }} className="h-1.5 rounded-full mr-2 opacity-30" />
              );
            })}
          </View>

          <TouchableOpacity
            onPress={scrollToNext}
            activeOpacity={0.7}
            style={{ width: wp("18%"), height: wp("18%") }}
            className="bg-white rounded-full items-center justify-center shadow-xl"
          >
            {currentIndex === SLIDES.length - 1 ? (
              <Text style={{ fontFamily: "Outfit-Bold" }} className="text-black">GO</Text>
            ) : (
              <Ionicons name="arrow-forward" size={28} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}