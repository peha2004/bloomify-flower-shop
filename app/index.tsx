import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="flex-1 items-center justify-center px-8">
   
        <View className="w-32 h-32 rounded-full bg-pink-200 items-center justify-center mb-8">
          <Text className="text-6xl">🌸</Text>
        </View>

        <Text className="text-4xl font-bold text-pink-700 mb-2 text-center">
          Bloomify
        </Text>
        <Text className="text-base text-pink-400 text-center mb-12">
          Fresh flowers, delivered with care
        </Text>
      </View>

      <View className="px-8 pb-10">
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          className="bg-pink-600 rounded-2xl py-4 items-center mb-3 active:bg-pink-700"
        >
          <Text className="text-white text-base font-semibold">Get Started</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          className="border border-pink-300 rounded-2xl py-4 items-center active:bg-pink-100"
        >
          <Text className="text-pink-700 text-base font-semibold">
            I already have an account
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}