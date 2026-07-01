import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Pressable,
  TextInput, ScrollView, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getFlowers, Flower } from '@/services/flowerService';
import FlowerCard from '@/components/FlowerCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['All', 'BOUQUET', 'SINGLE', 'ARRANGEMENT', 'SEASONAL'];

export default function Shop() {
  const { user } = useAuth();
  const router = useRouter();
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [filtered, setFiltered] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const load = async () => {
    const data = await getFlowers();
    setFlowers(data);
    setFiltered(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = flowers;
    if (category !== 'All') result = result.filter(f => f.category === category);
    if (search) result = result.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, category, flowers]);

  if (loading) return <LoadingSpinner message="Loading flowers..." />;

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
   
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-2xl font-bold text-pink-700">🌸 Bloomify</Text>
            <Text className="text-pink-400 text-sm">Hello, {user?.name?.split(' ')[0]} 👋</Text>
          </View>
          {user?.role === 'admin' && (
            <Pressable
              onPress={() => router.push('/admin')}
              className="bg-pink-600 px-3 py-2 rounded-xl"
            >
              <Text className="text-white text-xs font-semibold">Admin Panel</Text>
            </Pressable>
          )}
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="🔍  Search flowers..."
          placeholderTextColor="#D88FB0"
          className="bg-white border border-pink-200 rounded-xl px-4 py-3 mt-3 text-pink-900"
        />

        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-1">
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              className={`mr-2 px-4 py-2 rounded-full ${category === cat ? 'bg-pink-600' : 'bg-white border border-pink-200'}`}
            >
              <Text className={`text-xs font-semibold ${category === cat ? 'text-white' : 'text-pink-500'}`}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Flower grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#E91E8C']} />}
        renderItem={({ item }) => (
          <View className="flex-1">
            <FlowerCard
              flower={item}
              onPress={() => router.push(`/flower/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">🌷</Text>
            <Text className="text-pink-400 text-base">No flowers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}