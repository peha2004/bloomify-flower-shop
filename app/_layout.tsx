import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="flower/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </CartProvider>
    </AuthProvider>
  );
}