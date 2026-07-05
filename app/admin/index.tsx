import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput,
  Modal, Alert, ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  getAllFlowers, addFlower, updateFlower,
  deleteFlower, Flower
} from '@/services/flowerService';
import { getAllOrders, Order } from '@/services/orderService';
import { getAllUsers } from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';

const CATEGORIES = ['BOUQUET', 'SINGLE', 'ARRANGEMENT', 'SEASONAL'];
const PRESET_COLORS = ['#FF6B9D', '#FF0000', '#FFD700', '#FFFFFF', '#FF69B4', '#9B59B6', '#FF8C00', '#FF1493'];
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: '#FEF3C7', text: '#92400E' },
  CONFIRMED: { bg: '#DBEAFE', text: '#1E40AF' },
  DELIVERED: { bg: '#D1FAE5', text: '#065F46' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
};

type AdminTab = 'dashboard' | 'flowers' | 'orders';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Flower | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('BOUQUET');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [f, o, u] = await Promise.all([getAllFlowers(), getAllOrders(), getAllUsers()]);
    setFlowers(f);
    setOrders(o);
    setUsers(u);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadAll(); }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const activeFlowers = flowers.filter(f => f.isActive).length;
  const customerUsers = users.filter(u => u.role === 'customer');

  const openAdd = () => {
    setEditing(null);
    setName(''); setDescription(''); setPrice('');
    setCategory('BOUQUET'); setImageUrl(''); setStock('');
    setSelectedColors([]);
    setModalVisible(true);
  };

  const openEdit = (flower: Flower) => {
    setEditing(flower);
    setName(flower.name); setDescription(flower.description);
    setPrice(flower.price.toString()); setCategory(flower.category);
    setImageUrl(flower.imageUrl || ''); setStock(flower.stock.toString());
    setSelectedColors(flower.colors || []);
    setModalVisible(true);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !stock) {
      Alert.alert('Missing fields', 'Name, price and stock are required.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    setSaving(true);
    const data = {
      name: name.trim(), description: description.trim(),
      price: parseFloat(price), category, imageUrl: imageUrl.trim(),
      stock: parseInt(stock), colors: selectedColors, isActive: true,
    };
    try {
      if (editing) {
        await updateFlower(editing.id, data);
      } else {
        await addFlower(data);
      }
      setModalVisible(false);
      loadAll();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (flower: Flower) => {
    Alert.alert('Delete Flower', `Remove "${flower.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteFlower(flower.id); loadAll(); } }
    ]);
  };

  const handleToggleActive = async (flower: Flower) => {
    await updateFlower(flower.id, { isActive: !flower.isActive });
    loadAll();
  };

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
   
      <View style={{ backgroundColor: '#C2185B' }} className="px-5 pt-4 pb-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">🌸 Admin Panel</Text>
            <Text style={{ color: '#F9A8D4' }} className="text-sm">Bloomify Management</Text>
          </View>
          <Pressable
            onPress={async () => {
              const { logoutUser } = await import('@/services/authService');
              await logoutUser();
              router.replace('/');
            }}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            className="px-3 py-2 rounded-xl"
          >
            <Text className="text-white text-sm">Sign Out</Text>
          </Pressable>
        </View>

        <View className="flex-row mt-4 gap-2">
          {([
            { key: 'dashboard', label: '📊 Overview' },
            { key: 'flowers',   label: '🌸 Flowers' },
            { key: 'orders',    label: '📦 Orders' },
          ] as { key: AdminTab; label: string }[]).map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.2)',
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              }}
            >
              <Text style={{
                color: activeTab === tab.key ? '#C2185B' : '#fff',
                fontSize: 12, fontWeight: '600'
              }}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === 'dashboard' && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadAll(); }}
              colors={['#E91E8C']}
            />
          }
        >
          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            Overview
          </Text>

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-white rounded-2xl p-4 border border-pink-100">
              <Text className="text-2xl font-bold text-pink-700">
                LKR {totalRevenue.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Total Revenue</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 border border-pink-100">
              <Text className="text-2xl font-bold text-blue-600">{orders.length}</Text>
              <Text className="text-gray-500 text-xs mt-1">Total Orders</Text>
            </View>
          </View>
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1 bg-white rounded-2xl p-4 border border-pink-100">
              <Text className="text-2xl font-bold text-pink-600">{activeFlowers}</Text>
              <Text className="text-gray-500 text-xs mt-1">Active Flowers</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 border border-pink-100">
              <Text className="text-2xl font-bold text-purple-600">{customerUsers.length}</Text>
              <Text className="text-gray-500 text-xs mt-1">Registered Users</Text>
            </View>
          </View>

          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            Registered Users
          </Text>
          {customerUsers.map((u, idx) => (
            <View key={idx} className="bg-white rounded-2xl p-4 mb-2 border border-pink-100 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-3">
                <Text className="text-lg">🌸</Text>
              </View>
              <View className="flex-1">
                <Text className="text-pink-900 font-semibold text-sm">{u.name}</Text>
                <Text className="text-gray-400 text-xs">{u.email}</Text>
              </View>
              <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ color: '#6D28D9', fontSize: 10, fontWeight: '700' }}>Customer</Text>
              </View>
            </View>
          ))}
          {customerUsers.length === 0 && (
            <View className="items-center py-6 bg-white rounded-2xl border border-pink-100 mb-4">
              <Text className="text-3xl mb-2">👤</Text>
              <Text className="text-gray-400 text-sm">No customers yet</Text>
            </View>
          )}

          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3 mt-4">
            Recent Orders
          </Text>
          {orders.slice(0, 5).map(order => {
            const date = order.createdAt?.seconds
              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
              : 'Now';
            return (
              <View key={order.id} className="bg-white rounded-2xl p-4 mb-2 border border-pink-100 flex-row items-center">
                <View className="flex-1">
                  <Text className="text-pink-900 font-semibold text-sm">
                    #{order.id.slice(-6).toUpperCase()} — {order.userName}
                  </Text>
                  <Text className="text-gray-400 text-xs">{date} · {order.items.length} item(s)</Text>
                </View>
                <View className="items-end">
                  <Text className="text-pink-700 font-bold text-sm">
                    LKR {order.totalPrice.toLocaleString()}
                  </Text>
                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 4 }}>
                    <Text style={{ color: '#065F46', fontSize: 10, fontWeight: '700' }}>✅ PAID</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {orders.length === 0 && (
            <View className="items-center py-8 bg-white rounded-2xl border border-pink-100">
              <Text className="text-4xl mb-2">📋</Text>
              <Text className="text-gray-400">No orders yet</Text>
            </View>
          )}

          <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3 mt-5">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mb-6">
            <Pressable
              onPress={() => { setActiveTab('flowers'); openAdd(); }}
              className="flex-1 bg-pink-600 rounded-2xl p-4 items-center"
            >
              <Text className="text-white font-semibold">+ Add Flower</Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('orders')}
              className="flex-1 bg-white border border-pink-200 rounded-2xl p-4 items-center"
            >
              <Text className="text-pink-600 font-semibold">View Orders</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {activeTab === 'flowers' && (
        <>
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className="text-gray-700 font-semibold">{flowers.length} flowers</Text>
            <Pressable onPress={openAdd} className="bg-pink-600 px-4 py-2 rounded-xl">
              <Text className="text-white font-semibold text-sm">+ Add Flower</Text>
            </Pressable>
          </View>

          <FlatList
            data={flowers}
            keyExtractor={f => f.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadAll(); }}
                colors={['#E91E8C']}
              />
            }
            renderItem={({ item }) => (
              <View
                className="bg-white rounded-2xl p-4 mb-3 border border-pink-100"
                style={{ opacity: item.isActive ? 1 : 0.55 }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="font-bold text-pink-900 text-base">{item.name}</Text>
                    <Text className="text-gray-400 text-xs" numberOfLines={2}>{item.description}</Text>
                  </View>
                  <View className="flex-row gap-1">
                    {item.colors?.slice(0, 3).map((c, i) => (
                      <View key={i} style={{ backgroundColor: c, width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#eee' }} />
                    ))}
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-pink-700 font-bold">LKR {item.price.toLocaleString()}</Text>
                    <Text className="text-gray-400 text-xs">Stock: {item.stock} · {item.category}</Text>
                  </View>
                  <View className="flex-row gap-2 items-center">
                    <Pressable
                      onPress={() => handleToggleActive(item)}
                      style={{ backgroundColor: item.isActive ? '#D1FAE5' : '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
                    >
                      <Text style={{ color: item.isActive ? '#065F46' : '#6B7280', fontSize: 11, fontWeight: '600' }}>
                        {item.isActive ? '● Active' : '○ Hidden'}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => openEdit(item)} className="bg-pink-100 px-3 py-1.5 rounded-lg">
                      <Text className="text-pink-700 text-xs font-semibold">Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item)} className="bg-red-100 px-3 py-1.5 rounded-lg">
                      <Text className="text-red-500 text-xs font-semibold">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Text className="text-5xl mb-3">🌷</Text>
                <Text className="text-gray-400">No flowers yet. Add one!</Text>
              </View>
            }
          />
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className="text-gray-700 font-semibold">{orders.length} total orders</Text>
            <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ color: '#92400E', fontSize: 11, fontWeight: '700' }}>
                💰 LKR {totalRevenue.toLocaleString()} total
              </Text>
            </View>
          </View>

          <FlatList
            data={orders}
            keyExtractor={o => o.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadAll(); }}
                colors={['#E91E8C']}
              />
            }
            renderItem={({ item }) => {
              const date = item.createdAt?.seconds
                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })
                : 'Just now';
              return (
                <View className="bg-white rounded-2xl p-4 mb-3 border border-pink-100">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="font-bold text-pink-900 text-base">
                        #{item.id.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-gray-400 text-xs">👤 {item.userName}</Text>
                      <Text className="text-gray-400 text-xs">📅 {date}</Text>
                    </View>
                    <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                      <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '700' }}>✅ PAID</Text>
                    </View>
                  </View>
                  <View className="bg-gray-50 rounded-xl p-3 mb-2">
                    <Text className="text-xs font-semibold text-gray-400 uppercase mb-2">Items</Text>
                    {item.items.map((i, idx) => (
                      <View key={idx} className="flex-row justify-between py-0.5">
                        <Text className="text-gray-700 text-sm">🌸 {i.flowerName} ×{i.quantity}</Text>
                        <Text className="text-pink-700 text-sm font-semibold">
                          LKR {(i.price * i.quantity).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                    <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
                      <Text className="text-gray-600 font-bold">Total Received</Text>
                      <Text className="text-pink-700 font-bold text-base">
                        LKR {item.totalPrice.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Text className="text-5xl mb-3">📋</Text>
                <Text className="text-gray-400">No orders yet</Text>
              </View>
            }
          />
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-pink-50">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-pink-100">
            <Text className="text-xl font-bold text-pink-700">
              {editing ? 'Edit Flower' : 'Add New Flower'}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text className="text-pink-400">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
            <Text className="text-sm font-medium text-pink-700 mb-1">Flower Name *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Red Roses"
              placeholderTextColor="#D88FB0"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-1">Description</Text>
            <TextInput value={description} onChangeText={setDescription}
              placeholder="Short description..." placeholderTextColor="#D88FB0"
              multiline numberOfLines={3} textAlignVertical="top"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900 h-20" />

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-pink-700 mb-1">Price (LKR) *</Text>
                <TextInput value={price} onChangeText={setPrice} placeholder="500"
                  placeholderTextColor="#D88FB0" keyboardType="numeric"
                  className="bg-white border border-pink-200 rounded-xl px-4 py-3 text-pink-900" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-pink-700 mb-1">Stock *</Text>
                <TextInput value={stock} onChangeText={setStock} placeholder="10"
                  placeholderTextColor="#D88FB0" keyboardType="numeric"
                  className="bg-white border border-pink-200 rounded-xl px-4 py-3 text-pink-900" />
              </View>
            </View>

            <Text className="text-sm font-medium text-pink-700 mb-1">Image URL</Text>
            <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..."
              placeholderTextColor="#D88FB0" autoCapitalize="none"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <Pressable key={cat} onPress={() => setCategory(cat)}
                  style={{
                    backgroundColor: category === cat ? '#E91E8C' : '#fff',
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    borderWidth: 1, borderColor: category === cat ? '#E91E8C' : '#F9A8D4',
                  }}>
                  <Text style={{ color: category === cat ? '#fff' : '#BE185D', fontSize: 12, fontWeight: '600' }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-pink-700 mb-2">🎨 Flower Colors</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {PRESET_COLORS.map(color => (
                <Pressable key={color} onPress={() => toggleColor(color)}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: color,
                    borderWidth: selectedColors.includes(color) ? 3 : 1.5,
                    borderColor: selectedColors.includes(color) ? '#E91E8C' : '#ddd',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  {selectedColors.includes(color) && (
                    <Text style={{ fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="bg-pink-600 rounded-2xl py-4 items-center mb-8"
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-semibold text-base">
                    {editing ? 'Save Changes' : '+ Add Flower'}
                  </Text>
              }
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}