import { View, Text, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { Flower } from '@/services/flowerService';
import { useCart } from '@/context/CartContext';

interface Props {
  flower: Flower;
  onPress?: () => void;
}

export default function FlowerCard({ flower, onPress }: Props) {
  const { addToCart, items } = useCart();
  const inCart = items.find(i => i.id === flower.id);
  const [imgError, setImgError] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-pink-100"
    >
      <View className="h-40 bg-pink-50 items-center justify-center relative">
        {flower.imageUrl && !imgError ? (
          <Image
            source={{ uri: flower.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Text className="text-5xl">🌸</Text>
        )}
      
        <View style={{ position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', gap: 4 }}>
          {flower.colors?.slice(0, 4).map((color, i) => (
            <View
              key={i}
              style={{
                backgroundColor: color,
                width: 14, height: 14,
                borderRadius: 7,
                borderWidth: 1,
                borderColor: '#fff'
              }}
            />
          ))}
        </View>
      </View>

      <View className="p-3">
        <Text className="text-base font-semibold text-pink-900" numberOfLines={1}>
          {flower.name}
        </Text>
        <Text className="text-xs text-pink-400 mb-2" numberOfLines={2}>
          {flower.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-pink-700 font-bold text-base">
            LKR {flower.price.toLocaleString()}
          </Text>
          <Pressable
            onPress={() => addToCart({
              id: flower.id,
              name: flower.name,
              price: flower.price,
              imageUrl: flower.imageUrl,
            })}
            className="bg-pink-600 px-3 py-1.5 rounded-xl active:bg-pink-700"
          >
            <Text className="text-white text-xs font-semibold">
              {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}