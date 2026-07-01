import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserOrders, Order } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const data = await getUserOrders(user.uid);
    setOrders(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [user]);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-pink-700">My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#E91E8C']} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-pink-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-pink-900 font-semibold">Order #{item.id.slice(-6).toUpperCase()}</Text>
              <View className={`px-2 py-1 rounded-full ${STATUS_COLORS[item.status]?.split(' ')[0]}`}>
                <Text className={`text-xs font-semibold ${STATUS_COLORS[item.status]?.split(' ')[1]}`}>
                  {item.status}
                </Text>
              </View>
            </View>
            {item.items.map((i, idx) => (
              <Text key={idx} className="text-pink-400 text-sm">
                • {i.flowerName} × {i.quantity}
              </Text>
            ))}
            <View className="mt-2 pt-2 border-t border-pink-50 flex-row justify-between">
              <Text className="text-pink-400 text-sm">Total</Text>
              <Text className="text-pink-700 font-bold">LKR {item.totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">📦</Text>
            <Text className="text-pink-400">No orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}