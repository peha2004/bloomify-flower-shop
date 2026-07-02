import { View, Text, Pressable } from 'react-native';
import { CartItem as CartItemType } from '@/context/CartContext';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3 border border-pink-100">
      <View className="w-14 h-14 bg-pink-50 rounded-xl items-center justify-center mr-3">
        <Text className="text-2xl">🌸</Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-pink-900">{item.name}</Text>
        <Text className="text-pink-600 font-bold">LKR {(item.price * item.quantity).toLocaleString()}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center"
        >
          <Text className="text-pink-700 font-bold">−</Text>
        </Pressable>
        <Text className="text-pink-900 font-semibold w-5 text-center">{item.quantity}</Text>
        <Pressable
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 bg-pink-600 rounded-full items-center justify-center"
        >
          <Text className="text-white font-bold">+</Text>
        </Pressable>
        <Pressable
          onPress={() => removeFromCart(item.id)}
          className="w-8 h-8 bg-red-100 rounded-full items-center justify-center ml-1"
        >
          <Text className="text-red-500 text-xs font-bold">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}