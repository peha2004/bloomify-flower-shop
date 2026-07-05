import { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserOrders, Order } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { bg: '#DBEAFE', text: '#1E40AF' },
  DELIVERED: { bg: '#D1FAE5', text: '#065F46' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const data = await getUserOrders(user.uid);
    data.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
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
        <Text className="text-pink-400 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={['#E91E8C']}
          />
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.PENDING;
          const date = item.createdAt?.seconds
            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
              })
            : 'Just now';

          return (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-pink-100">
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className="text-pink-900 font-bold text-base">
                    Order #{item.id.slice(-6).toUpperCase()}
                  </Text>
                  <Text className="text-pink-400 text-xs mt-0.5">{date}</Text>
                </View>
                <View style={{
                  backgroundColor: statusStyle.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}>
                  <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: '700' }}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View className="bg-pink-50 rounded-xl p-3 mb-3">
                <Text className="text-xs font-semibold text-pink-500 mb-2 uppercase tracking-wide">
                  Items Ordered
                </Text>
                {item.items.map((i, idx) => (
                  <View key={idx} className="flex-row justify-between items-center py-1">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-pink-300 mr-2">🌸</Text>
                      <Text className="text-pink-900 text-sm font-medium flex-1" numberOfLines={1}>
                        {i.flowerName}
                      </Text>
                    </View>
                    <View className="flex-row items-center ml-2">
                      <Text className="text-pink-400 text-xs">x{i.quantity}  </Text>
                      <Text className="text-pink-700 text-sm font-semibold">
                        LKR {(i.price * i.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-pink-50">
                <Text className="text-pink-500 text-sm">
                  {item.items.reduce((sum, i) => sum + i.quantity, 0)} item{item.items.length !== 1 ? 's' : ''}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-pink-400 text-sm mr-2">Total</Text>
                  <Text className="text-pink-700 font-bold text-lg">
                    LKR {item.totalPrice.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-6xl mb-4">📦</Text>
            <Text className="text-pink-700 font-bold text-lg mb-1">No orders yet</Text>
            <Text className="text-pink-400">Your flower orders will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}