import { View, Text } from 'react-native';
import { Order } from '@/services/orderService';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { bg: '#DBEAFE', text: '#1E40AF' },
  DELIVERED: { bg: '#D1FAE5', text: '#065F46' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function OrderCard({ order }: { order: Order }) {
  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
  const date = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : 'Just now';

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-pink-100">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-pink-900 font-bold text-base">
            Order #{order.id.slice(-6).toUpperCase()}
          </Text>
          <Text className="text-pink-400 text-xs mt-0.5">{date}</Text>
        </View>
        <View style={{
          backgroundColor: statusStyle.bg,
          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
        }}>
          <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: '700' }}>
            {order.status}
          </Text>
        </View>
      </View>

      <View className="bg-pink-50 rounded-xl p-3 mb-3">
        {order.items.map((i, idx) => (
          <View key={idx} className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center flex-1">
              <Text className="text-pink-300 mr-2">🌸</Text>
              <Text className="text-pink-900 text-sm font-medium flex-1" numberOfLines={1}>
                {i.flowerName}
              </Text>
            </View>
            <Text className="text-pink-700 text-sm font-semibold">
              x{i.quantity}  LKR {(i.price * i.quantity).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center pt-2 border-t border-pink-50">
        <Text className="text-pink-400 text-sm">
          {order.items.reduce((s, i) => s + i.quantity, 0)} items
        </Text>
        <Text className="text-pink-700 font-bold text-base">
          LKR {order.totalPrice.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}