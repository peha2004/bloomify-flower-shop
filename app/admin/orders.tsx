import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllOrders, Order, updateOrderStatus } from '@/services/orderService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Pressable } from 'react-native';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const;
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FEF3C7',
  CONFIRMED: '#DBEAFE',
  DELIVERED: '#D1FAE5',
  CANCELLED: '#FEE2E2',
};
const STATUS_TEXT: Record<string, string> = {
  PENDING: '#92400E',
  CONFIRMED: '#1E40AF',
  DELIVERED: '#065F46',
  CANCELLED: '#991B1B',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (order: Order, status: Order['status']) => {
    await updateOrderStatus(order.id, status);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-pink-700">All Orders</Text>
        <Text className="text-pink-400 text-sm">{orders.length} orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#E91E8C']} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-pink-100">
            <View className="flex-row justify-between mb-1">
              <Text className="font-bold text-pink-900">#{item.id.slice(-6).toUpperCase()}</Text>
              <View style={{ backgroundColor: STATUS_COLORS[item.status], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                <Text style={{ color: STATUS_TEXT[item.status], fontSize: 11, fontWeight: '600' }}>{item.status}</Text>
              </View>
            </View>
            <Text className="text-pink-500 text-sm mb-1">👤 {item.userName}</Text>
            {item.items.map((i, idx) => (
              <Text key={idx} className="text-pink-400 text-xs">• {i.flowerName} × {i.quantity}</Text>
            ))}
            <Text className="text-pink-700 font-bold mt-2">LKR {item.totalPrice.toLocaleString()}</Text>
            <View className="flex-row flex-wrap gap-1 mt-3">
              {STATUS_OPTIONS.map(s => (
                <Pressable
                  key={s}
                  onPress={() => handleStatus(item, s)}
                  className={`px-2 py-1 rounded-lg ${item.status === s ? 'bg-pink-600' : 'bg-pink-100'}`}
                >
                  <Text className={`text-xs font-semibold ${item.status === s ? 'text-white' : 'text-pink-500'}`}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">📋</Text>
            <Text className="text-pink-400">No orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}