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
import { registerUser } from '@/services/authService';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords don\'t match', 'Please re-enter your password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration failed', error.message || 'Something went wrong.');
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
          <View className="flex-1 px-8 pt-12 pb-6">
            <Text className="text-3xl font-bold text-pink-700 mb-1">
              Create account
            </Text>
            <Text className="text-base text-pink-400 mb-8">
              Join Bloomify and start shopping
            </Text>

            <Text className="text-sm font-medium text-pink-700 mb-2">Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Jane Doe"
              placeholderTextColor="#D88FB0"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900"
            />

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

            <Text className="text-sm font-medium text-pink-700 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900"
            />

            <Text className="text-sm font-medium text-pink-700 mb-2">Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor="#D88FB0"
              secureTextEntry
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-6 text-pink-900"
            />

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              className="bg-pink-600 rounded-2xl py-4 items-center mb-4 active:bg-pink-700"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Create account</Text>
              )}
            </Pressable>

            <View className="flex-row justify-center">
              <Text className="text-pink-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-pink-700 font-semibold">Login</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}