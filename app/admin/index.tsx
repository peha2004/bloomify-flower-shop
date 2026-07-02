import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput,
  Modal, Alert, ScrollView, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getAllFlowers, addFlower, updateFlower,
  deleteFlower, Flower
} from '@/services/flowerService';
import LoadingSpinner from '@/components/LoadingSpinner';

const CATEGORIES = ['BOUQUET', 'SINGLE', 'ARRANGEMENT', 'SEASONAL'];
const PRESET_COLORS = ['#FF6B9D', '#FF0000', '#FFD700', '#FFFFFF', '#FF69B4', '#9B59B6', '#FF8C00', '#FF1493'];

export default function AdminDashboard() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
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

  const load = async () => {
    const data = await getAllFlowers();
    setFlowers(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setName(''); setDescription(''); setPrice('');
    setCategory('BOUQUET'); setImageUrl(''); setStock('');
    setSelectedColors([]);
    setModalVisible(true);
  };

  const openEdit = (flower: Flower) => {
    setEditing(flower);
    setName(flower.name);
    setDescription(flower.description);
    setPrice(flower.price.toString());
    setCategory(flower.category);
    setImageUrl(flower.imageUrl || '');
    setStock(flower.stock.toString());
    setSelectedColors(flower.colors || []);
    setModalVisible(true);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSave = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Missing fields', 'Name, price and stock are required.');
      return;
    }
    const data = {
      name, description,
      price: parseFloat(price),
      category, imageUrl,
      stock: parseInt(stock),
      colors: selectedColors,
      isActive: true,
    };
    try {
      if (editing) {
        await updateFlower(editing.id, data);
      } else {
        await addFlower(data);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (flower: Flower) => {
    Alert.alert('Delete flower', `Remove "${flower.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteFlower(flower.id);
          load();
        }
      }
    ]);
  };

  const handleToggleActive = async (flower: Flower) => {
    await updateFlower(flower.id, { isActive: !flower.isActive });
    load();
  };

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-pink-700">Admin Panel</Text>
          <Text className="text-pink-400 text-sm">{flowers.length} flowers total</Text>
        </View>
        <Pressable
          onPress={openAdd}
          className="bg-pink-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">+ Add Flower</Text>
        </Pressable>
      </View>

      <FlatList
        data={flowers}
        keyExtractor={f => f.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#E91E8C']} />}
        renderItem={({ item }) => (
          <View className={`bg-white rounded-2xl p-4 mb-3 border ${item.isActive ? 'border-pink-100' : 'border-gray-200 opacity-60'}`}>
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1">
                <Text className="font-bold text-pink-900">{item.name}</Text>
                <Text className="text-pink-400 text-xs" numberOfLines={2}>{item.description}</Text>
              </View>
              <View className="flex-row gap-1 ml-2">
                {item.colors?.slice(0, 3).map((c, i) => (
                  <View key={i} style={{ backgroundColor: c, width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' }} />
                ))}
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <View>
                <Text className="text-pink-700 font-bold">LKR {item.price.toLocaleString()}</Text>
                <Text className="text-xs text-pink-400">Stock: {item.stock} | {item.category}</Text>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleToggleActive(item)}
                  className={`px-2 py-1 rounded-lg ${item.isActive ? 'bg-green-100' : 'bg-gray-100'}`}
                >
                  <Text className={`text-xs font-semibold ${item.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => openEdit(item)} className="bg-pink-100 px-2 py-1 rounded-lg">
                  <Text className="text-pink-700 text-xs font-semibold">Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(item)} className="bg-red-100 px-2 py-1 rounded-lg">
                  <Text className="text-red-500 text-xs font-semibold">Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-pink-50">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-pink-100">
            <Text className="text-xl font-bold text-pink-700">
              {editing ? 'Edit Flower' : 'Add Flower'}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text className="text-pink-400 text-base">Cancel</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
            <Text className="text-sm font-medium text-pink-700 mb-1">Flower Name *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Red Roses" placeholderTextColor="#D88FB0"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-1">Description</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Short description..." placeholderTextColor="#D88FB0"
              multiline numberOfLines={3} textAlignVertical="top"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900 h-20" />

            <Text className="text-sm font-medium text-pink-700 mb-1">Price (LKR) *</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder="500" placeholderTextColor="#D88FB0"
              keyboardType="numeric"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-1">Stock *</Text>
            <TextInput value={stock} onChangeText={setStock} placeholder="10" placeholderTextColor="#D88FB0"
              keyboardType="numeric"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-1">Image URL</Text>
            <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="#D88FB0"
              autoCapitalize="none"
              className="bg-white border border-pink-200 rounded-xl px-4 py-3 mb-4 text-pink-900" />

            <Text className="text-sm font-medium text-pink-700 mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <Pressable key={cat} onPress={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-full ${category === cat ? 'bg-pink-600' : 'bg-white border border-pink-200'}`}>
                  <Text className={`text-xs font-semibold ${category === cat ? 'text-white' : 'text-pink-500'}`}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-pink-700 mb-2">Flower Colors</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {PRESET_COLORS.map(color => (
                <Pressable
                  key={color}
                  onPress={() => toggleColor(color)}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: color,
                    borderWidth: selectedColors.includes(color) ? 3 : 1,
                    borderColor: selectedColors.includes(color) ? '#E91E8C' : '#ddd',
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              className="bg-pink-600 rounded-2xl py-4 items-center mb-8"
            >
              <Text className="text-white font-semibold text-base">
                {editing ? 'Save Changes' : 'Add Flower'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}