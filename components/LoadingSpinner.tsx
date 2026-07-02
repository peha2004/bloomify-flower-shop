import { View, ActivityIndicator, Text } from 'react-native';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-pink-50">
      <ActivityIndicator size="large" color="#E91E8C" />
      <Text className="text-pink-400 mt-3">{message}</Text>
    </View>
  );
}