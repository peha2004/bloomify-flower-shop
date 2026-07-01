import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '@/services/authService';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login failed', error.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 pt-12">
            <Text className="text-3xl font-bold text-pink-700 mb-1">
              Welcome back
            </Text>
            <Text className="text-base text-pink-400 mb-10">
              Login to continue shopping
            </Text>

            {/* Email */}
            <Text className="text-sm font-medium text-pink-700 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#D88FB0"
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900"
            />

            {/* Password */}
            <Text className="text-sm font-medium text-pink-700 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-6 text-pink-900"
            />

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className="bg-pink-600 rounded-2xl py-4 items-center mb-4 active:bg-pink-700"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Login</Text>
              )}
            </Pressable>

            <View className="flex-row justify-center">
              <Text className="text-pink-500">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-pink-700 font-semibold">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}