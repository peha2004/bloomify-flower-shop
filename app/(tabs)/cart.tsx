import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { placeOrder } from '@/services/orderService';
import CartItemComponent from '@/components/CartItem';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Cart() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) return;
    setPlacing(true);
    try {
      await placeOrder({
        userId: user.uid,
        userName: user.name,
        items: items.map(i => ({
          flowerId: i.id,
          flowerName: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalPrice,
        status: 'PENDING',
      });
      clearCart();
      Alert.alert('🌸 Order placed!', 'Your flowers are on the way!', [
        { text: 'View Orders', onPress: () => router.push('/(tabs)/orders') },
        { text: 'Continue Shopping' },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-pink-50 items-center justify-center">
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className="text-xl font-bold text-pink-700 mb-2">Your cart is empty</Text>
        <Text className="text-pink-400">Add some beautiful flowers!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-pink-700 mb-1">Your Cart</Text>
        <Text className="text-pink-400 text-sm">{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => <CartItemComponent item={item} />}
      />

     
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-pink-100 px-5 py-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-pink-700 font-semibold text-base">Total</Text>
          <Text className="text-pink-700 font-bold text-xl">
            LKR {totalPrice.toLocaleString()}
          </Text>
        </View>
        <Pressable
          onPress={handlePlaceOrder}
          disabled={placing}
          className="bg-pink-600 rounded-2xl py-4 items-center active:bg-pink-700"
        >
          <Text className="text-white font-semibold text-base">
            {placing ? 'Placing order...' : '🌸 Place Order'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}