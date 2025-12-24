import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const MessListScreen = ({ route, navigation }) => {
  const { area } = route.params;
  const [messes, setMesses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesses();
  }, [area]);

  const fetchMesses = async () => {
    try {
      const { data, error } = await supabase
        .from('messes')
        .select('*, areas(name)')
        .eq('area_id', area.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMesses(data || []);
    } catch (error) {
      console.error('Error fetching messes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMesses();
    setRefreshing(false);
  };

  const renderMess = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MessDetailExplore', { mess: item })}
      className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4"
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-xl bg-primary-600/30 items-center justify-center">
          <Text className="text-primary-400 text-xl font-bold">
            {item.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold text-lg">{item.name}</Text>
          {item.tagline && (
            <Text className="text-dark-400 text-sm mt-1" numberOfLines={1}>
              {item.tagline}
            </Text>
          )}
          {item.speciality && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="sparkles" size={12} color="#a855f7" />
              <Text className="text-primary-400 text-xs ml-1" numberOfLines={1}>
                {item.speciality}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-dark-950">
      {/* Area Header */}
      <View className="bg-dark-800 px-4 py-3 mx-4 mt-4 rounded-xl">
        <View className="flex-row items-center">
          <Ionicons name="location" size={20} color="#a855f7" />
          <Text className="text-white font-medium ml-2">{area.name}</Text>
          <Text className="text-dark-400 ml-2">({messes.length} messes)</Text>
        </View>
      </View>

      <FlatList
        data={messes}
        renderItem={renderMess}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          !loading && (
            <View className="items-center justify-center py-20">
              <Ionicons name="storefront-outline" size={48} color="#475569" />
              <Text className="text-dark-400 mt-4 text-center">
                No messes in this area yet
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default MessListScreen;
