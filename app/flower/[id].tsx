import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Flower } from '@/services/flowerService';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FlowerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, items } = useCart();
  const [flower, setFlower] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'flowers', id));
      if (snap.exists()) setFlower({ id: snap.id, ...snap.data() } as Flower);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!flower) return (
    <SafeAreaView className="flex-1 bg-pink-50 items-center justify-center">
      <Text className="text-pink-400">Flower not found</Text>
    </SafeAreaView>
  );

  const inCart = items.find(i => i.id === flower.id);

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <ScrollView>

        <View className="h-64 bg-pink-100 items-center justify-center">
          {flower.imageUrl ? (
            <Image source={{ uri: flower.imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Text className="text-8xl">🌸</Text>
          )}
        </View>

        <View className="px-5 pt-5">
          <Pressable onPress={() => router.back()} className="mb-4">
            <Text className="text-pink-500">← Back</Text>
          </Pressable>

          <Text className="text-3xl font-bold text-pink-900 mb-1">{flower.name}</Text>
          <Text className="text-pink-400 mb-3">{flower.category}</Text>
          <Text className="text-pink-700 mb-4">{flower.description}</Text>

          {flower.colors?.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-pink-700 mb-2">Available Colors</Text>
              <View className="flex-row gap-2">
                {flower.colors.map((c, i) => (
                  <View key={i} style={{ backgroundColor: c, width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#F9A8D4' }} />
                ))}
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-3xl font-bold text-pink-700">LKR {flower.price.toLocaleString()}</Text>
            <Text className="text-pink-400 text-sm">Stock: {flower.stock}</Text>
          </View>
        </View>
      </ScrollView>

   
      <View className="px-5 py-4 border-t border-pink-100 bg-white">
        <Pressable
          onPress={() => {
            addToCart({ id: flower.id, name: flower.name, price: flower.price, imageUrl: flower.imageUrl });
            Alert.alert('Added!', `${flower.name} added to cart 🌸`);
          }}
          className="bg-pink-600 rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-base">
            {inCart ? `In Cart (${inCart.quantity}) — Add More` : '🛒 Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}