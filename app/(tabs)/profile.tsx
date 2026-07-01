import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="px-5 pt-8">
        <Text className="text-2xl font-bold text-pink-700 mb-6">Profile</Text>

       
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-pink-200 items-center justify-center mb-3">
            <Text className="text-4xl">🌸</Text>
          </View>
          <Text className="text-xl font-bold text-pink-900">{user?.name}</Text>
          <Text className="text-pink-400">{user?.email}</Text>
          <View className="mt-2 bg-pink-100 px-3 py-1 rounded-full">
            <Text className="text-pink-600 text-xs font-semibold capitalize">{user?.role}</Text>
          </View>
        </View>

        {user?.role === 'admin' && (
          <Pressable
            onPress={() => router.push('/admin')}
            className="bg-pink-100 rounded-2xl p-4 mb-3 flex-row items-center"
          >
            <Text className="text-pink-700 font-semibold flex-1">🛠 Admin Panel</Text>
            <Text className="text-pink-400">→</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleSignOut}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 items-center mt-4"
        >
          <Text className="text-red-500 font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}