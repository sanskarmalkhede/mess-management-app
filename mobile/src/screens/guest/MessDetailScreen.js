import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const MessDetailScreen = ({ route, navigation }) => {
  const { mess: partialMess } = route.params;
  const [mess, setMess] = useState(partialMess);
  const [menuPosts, setMenuPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFullMessData();
    fetchMenuPosts();
  }, [partialMess.id]);

  // Fetch complete mess data including all fields
  const fetchFullMessData = async () => {
    try {
      const { data } = await supabase
        .from('messes')
        .select('*, areas(name)')
        .eq('id', partialMess.id)
        .single();

      if (data) {
        setMess(data);
      }
    } catch (error) {
      console.error('Error fetching mess data:', error);
    }
  };

  const fetchMenuPosts = async () => {
    try {
      const { data } = await supabase
        .from('menu_posts')
        .select('*')
        .eq('mess_id', partialMess.id)
        .gte('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      setMenuPosts(data || []);
    } catch (error) {
      console.error('Error fetching menu posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    if (mess?.geo_lat && mess?.geo_lng) {
      Linking.openURL(`https://maps.google.com/?q=${mess.geo_lat},${mess.geo_lng}`);
    } else if (mess?.address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(mess.address)}`);
    }
  };

  const callMess = () => {
    if (mess?.contact_number) {
      Linking.openURL(`tel:${mess.contact_number}`);
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#9333ea']}
        className="pt-4 pb-6 px-4 items-center"
      >
        <View className="w-20 h-20 rounded-2xl bg-white/20 items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">
            {mess.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text className="text-white text-2xl font-bold text-center">{mess.name}</Text>
        {mess.tagline && (
          <Text className="text-white/80 text-center mt-1">{mess.tagline}</Text>
        )}
        <View className="bg-white/20 px-3 py-1 rounded-full mt-3 flex-row items-center">
          <Ionicons name="location" size={14} color="white" />
          <Text className="text-white ml-1">{mess.areas?.name || 'Pune'}</Text>
        </View>

        {/* Quick Action Buttons - Inside Header */}
        <View className="flex-row w-full mt-4">
          {mess.contact_number && (
            <TouchableOpacity
              onPress={callMess}
              className="flex-1 bg-white/20 rounded-xl py-3 flex-row items-center justify-center mr-2"
            >
              <Ionicons name="call" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={openMaps}
            className={`flex-1 bg-white/20 rounded-xl py-3 flex-row items-center justify-center ${mess.contact_number ? 'ml-2' : ''}`}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Directions</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Info Cards */}
      <View className="px-4 pt-4">
        {mess.speciality && (
          <View className="bg-dark-800 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="sparkles" size={18} color="#a855f7" />
              <Text className="text-dark-400 ml-2 text-sm">Speciality</Text>
            </View>
            <Text className="text-white">{mess.speciality}</Text>
          </View>
        )}

        {mess.address && (
          <View className="bg-dark-800 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color="#a855f7" />
              <Text className="text-dark-400 ml-2 text-sm">Address</Text>
            </View>
            <Text className="text-white">{mess.address}</Text>
          </View>
        )}

        {mess.contact_number && (
          <View className="bg-dark-800 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="call" size={18} color="#a855f7" />
              <Text className="text-dark-400 ml-2 text-sm">Contact</Text>
            </View>
            <Text className="text-white">{mess.contact_number}</Text>
          </View>
        )}
      </View>

      {/* Today's Menu */}
      <View className="px-4 mt-4">
        <Text className="text-white text-lg font-semibold mb-3">Today's Menu</Text>
        {loading ? (
          <View className="bg-dark-800 rounded-2xl p-6 items-center">
            <ActivityIndicator color="#a855f7" />
          </View>
        ) : menuPosts.length > 0 ? (
          menuPosts.map((post) => (
            <View key={post.id} className="bg-dark-800 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">
                    {post.meal_type === 'lunch' ? '🌞' : '🌙'}
                  </Text>
                  <Text className="text-white font-semibold">{post.title}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${post.is_veg ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Text className={post.is_veg ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                    {post.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                  </Text>
                </View>
              </View>

              <View className="bg-dark-700 rounded-lg p-3 mb-3">
                {(post.items || []).map((item, idx) => (
                  <View key={idx} className="flex-row items-center py-1">
                    <Text className="text-primary-400 mr-2">•</Text>
                    <Text className="text-white">{item}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row items-center justify-between">
                {post.price && (
                  <Text className="text-primary-400 font-semibold">₹{post.price}</Text>
                )}
                <Text className="text-dark-500 text-sm">
                  {format(new Date(post.created_at), 'hh:mm a')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-dark-800 rounded-2xl p-6 items-center">
            <Ionicons name="restaurant-outline" size={32} color="#475569" />
            <Text className="text-dark-400 mt-2">No menu posted today</Text>
          </View>
        )}
      </View>

      {/* Login Prompt */}
      <View className="px-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Login')}
          className="bg-primary-600 rounded-xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-in-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Login to Join This Mess</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MessDetailScreen;
