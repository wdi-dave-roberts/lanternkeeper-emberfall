import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Custom dark theme for Emberfall
const EmberTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a0f1a",
    card: "#0a0f1a",
    text: "#fff8f0",
    border: "rgba(255, 200, 150, 0.1)",
    primary: "#f4a040",
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? EmberTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="first-lantern" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
