import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./feature/shared/data/AuthContext";
import { StatusBar, View, Text } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ToastProvider
        placement="top"
        duration={4000}
        animationType='slide-in'
        offset={60}
        renderToast={(toast) => (
          <View
            style={{
              width: wp(90),
              backgroundColor: toast.type === 'success' ? '#003580' : toast.type === 'danger' ? '#EF4444' : '#1E293B',
              paddingHorizontal: 30,
              paddingVertical: 20,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={
                toast.type === 'success' ? 'checkmark-circle' :
                  toast.type === 'danger' ? 'alert-circle' : 'information-circle'
              }
              size={20}
              color="white"
            />
            <Text
              style={{
                color: 'white',
                marginLeft: 12,
                fontFamily: 'Outfit-Medium',
                fontSize: 14,
                flex: 1,
              }}
            >
              {toast.message}
            </Text>
          </View>
        )}
      >
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}