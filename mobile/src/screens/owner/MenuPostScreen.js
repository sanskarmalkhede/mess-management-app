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
import { format, formatDistanceToNow, isPast } from 'date-fns';

const MenuPostScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_posts')
        .select('*')
        .eq('mess_id', mess.id)
        .order('created_at', { ascending: false })
        .limit(30);

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

  const renderPost = ({ item }) => {
    const isExpired = isPast(new Date(item.expiry_time));

    return (
      <View className={`bg-dark-800 rounded-2xl p-4 mb-3 mx-4 ${isExpired ? 'opacity-60' : ''}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">
              {item.meal_type === 'lunch' ? '🌞' : '🌙'}
            </Text>
            <View>
              <Text className="text-white font-semibold">{item.title}</Text>
              <Text className="text-dark-400 text-xs">
                {format(new Date(item.created_at), 'dd MMM, hh:mm a')}
              </Text>
            </View>
          </View>
          <View className={`px-2 py-1 rounded-full ${isExpired ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            <Text className={`text-xs ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
              {isExpired ? 'Expired' : 'Active'}
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
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded-full ${item.is_veg ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Text className={item.is_veg ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                {item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
              </Text>
            </View>
            {item.price && (
              <Text className="text-primary-400 font-semibold ml-3">₹{item.price}</Text>
            )}
          </View>
          <Text className="text-dark-500 text-xs">
            {isExpired
              ? `Expired ${formatDistanceToNow(new Date(item.expiry_time), { addSuffix: true })}`
              : `Expires ${formatDistanceToNow(new Date(item.expiry_time), { addSuffix: true })}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-dark-950">
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="restaurant-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4 text-center">
              No menu posts yet{'\n'}Create your first menu!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateMenu')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default MenuPostScreen;
