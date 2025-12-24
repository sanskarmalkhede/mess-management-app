import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, formatDistanceToNow } from 'date-fns';

const FeedScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_posts')
        .select('*, messes(name, areas(name))')
        .eq('mess_id', mess.id)
        .gte('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [mess?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <View className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">
            {item.meal_type === 'lunch' ? '🌞' : '🌙'}
          </Text>
          <View>
            <Text className="text-white font-semibold">{item.title}</Text>
            <Text className="text-dark-400 text-xs">
              {format(new Date(item.created_at), 'hh:mm a')}
            </Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${item.is_veg ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Text className={item.is_veg ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
            {item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
          </Text>
        </View>
      </View>

      <View className="bg-dark-700 rounded-lg p-3 mb-3">
        {(item.items || []).map((menuItem, idx) => (
          <View key={idx} className="flex-row items-center py-1">
            <Text className="text-primary-400 mr-2">•</Text>
            <Text className="text-white">{menuItem}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        {item.price && (
          <Text className="text-primary-400 font-semibold">₹{item.price}</Text>
        )}
        <Text className="text-dark-500 text-xs">
          Expires {formatDistanceToNow(new Date(item.expiry_time), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-dark-950">
      {/* Mess Info Header */}
      <TouchableOpacity
        onPress={() => navigation.navigate('MessProfileView')}
        className="mx-4 mt-4 bg-dark-800 rounded-xl p-3 flex-row items-center"
      >
        <View className="w-10 h-10 rounded-xl bg-primary-600/30 items-center justify-center">
          <Text className="text-primary-400 font-bold">
            {mess?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-medium">{mess?.name}</Text>
          <Text className="text-dark-400 text-xs">{mess?.areas?.name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="restaurant-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4 text-center">
              No menu posted yet today{'\n'}Check back later!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default FeedScreen;
