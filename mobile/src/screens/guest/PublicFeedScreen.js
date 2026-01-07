import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';

const PublicFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [mealFilter, setMealFilter] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedArea, mealFilter, vegOnly]);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setAreas(data || []);
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('menu_posts')
        .select('*, messes(id, name, areas(name))')
        .gte('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (mealFilter !== 'all') {
        query = query.eq('meal_type', mealFilter);
      }

      if (vegOnly) {
        query = query.eq('is_veg', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by area if selected (need post-filter due to nested relation)
      let filteredData = data || [];
      if (selectedArea) {
        filteredData = filteredData.filter(
          (p) => p.messes?.areas?.name === selectedArea.name
        );
      }

      setPosts(filteredData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MessDetail', { mess: { ...item.messes, areas: item.messes?.areas } })}
      className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-2">
            {item.meal_type === 'lunch' ? '🌞' : '🌙'}
          </Text>
          <View className="flex-1">
            <Text className="text-white font-semibold">{item.title}</Text>
            <Text className="text-dark-400 text-sm">{item.messes?.name}</Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${item.is_veg ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Text className={item.is_veg ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
            {item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
          </Text>
        </View>
      </View>

      <View className="bg-dark-700 rounded-lg p-3 mb-3">
        {(item.items || []).slice(0, 4).map((menuItem, idx) => (
          <View key={idx} className="flex-row items-center py-1">
            <Text className="text-primary-400 mr-2">•</Text>
            <Text className="text-white">{menuItem}</Text>
          </View>
        ))}
        {(item.items || []).length > 4 && (
          <Text className="text-dark-400 text-sm mt-1">
            +{item.items.length - 4} more items
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="location" size={14} color="#94a3b8" />
          <Text className="text-dark-400 text-sm ml-1">
            {item.messes?.areas?.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          {item.price && (
            <Text className="text-primary-400 font-semibold mr-3">₹{item.price}</Text>
          )}
          <Text className="text-dark-500 text-sm">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-dark-950">
      {/* Filters */}
      <View className="px-4 py-3 bg-dark-900">
        {/* Area Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity
            onPress={() => setSelectedArea(null)}
            className={`px-4 py-2 rounded-full mr-2 ${!selectedArea ? 'bg-primary-600' : 'bg-dark-700'}`}
          >
            <Text className={!selectedArea ? 'text-white font-medium' : 'text-dark-300'}>
              All Areas
            </Text>
          </TouchableOpacity>
          {areas.map((area) => (
            <TouchableOpacity
              key={area.id}
              onPress={() => setSelectedArea(area)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedArea?.id === area.id ? 'bg-primary-600' : 'bg-dark-700'
              }`}
            >
              <Text className={selectedArea?.id === area.id ? 'text-white font-medium' : 'text-dark-300'}>
                {area.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meal & Veg Filters */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setMealFilter('all')}
            className={`px-3 py-1.5 rounded-lg mr-2 ${mealFilter === 'all' ? 'bg-primary-600' : 'bg-dark-700'}`}
          >
            <Text className={mealFilter === 'all' ? 'text-white text-sm' : 'text-dark-300 text-sm'}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMealFilter('lunch')}
            className={`px-3 py-1.5 rounded-lg mr-2 ${mealFilter === 'lunch' ? 'bg-primary-600' : 'bg-dark-700'}`}
          >
            <Text className={mealFilter === 'lunch' ? 'text-white text-sm' : 'text-dark-300 text-sm'}>🌞 Lunch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMealFilter('dinner')}
            className={`px-3 py-1.5 rounded-lg mr-2 ${mealFilter === 'dinner' ? 'bg-primary-600' : 'bg-dark-700'}`}
          >
            <Text className={mealFilter === 'dinner' ? 'text-white text-sm' : 'text-dark-300 text-sm'}>🌙 Dinner</Text>
          </TouchableOpacity>
          <View className="flex-1" />
          <TouchableOpacity
            onPress={() => setVegOnly(!vegOnly)}
            className={`px-3 py-1.5 rounded-lg ${vegOnly ? 'bg-green-600' : 'bg-dark-700'}`}
          >
            <Text className={vegOnly ? 'text-white text-sm' : 'text-dark-300 text-sm'}>🌱 Veg</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          !loading && (
            <View className="items-center justify-center py-20">
              <Ionicons name="restaurant-outline" size={48} color="#475569" />
              <Text className="text-dark-400 mt-4 text-center">
                No menus posted yet{'\n'}Check back later!
              </Text>
            </View>
          )
        }
      />

      {/* Login FAB */}
      <TouchableOpacity
        onPress={() => navigation.getParent()?.getParent()?.navigate('Login')}
        className="absolute bottom-6 right-6 bg-primary-600 rounded-full px-5 py-3 flex-row items-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Ionicons name="log-in" size={20} color="white" />
        <Text className="text-white font-medium ml-2">Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PublicFeedScreen;

