import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const GuestHomeScreen = ({ navigation }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredMesses, setFeaturedMesses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch active areas
      const { data: areasData } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setAreas(areasData || []);

      // Fetch featured messes (limit 5)
      const { data: messesData } = await supabase
        .from('messes')
        .select('*, areas(name)')
        .eq('is_active', true)
        .limit(5);

      setFeaturedMesses(messesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = (area) => {
    navigation.navigate('MessList', { area });
  };

  const handleMessSelect = (mess) => {
    navigation.navigate('MessDetailExplore', { mess });
  };

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Hero Section */}
      <LinearGradient
        colors={['#7c3aed', '#9333ea', '#a855f7']}
        className="px-5 pt-6 pb-8 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-bold mb-2">
          Find Your Perfect Mess
        </Text>
        <Text className="text-white/80 mb-4">
          Browse messes in Pune, view menus, and more!
        </Text>

        {/* Login Prompt */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.getParent()?.navigate('Login')}
          className="bg-white/20 backdrop-blur rounded-xl py-3 px-4 flex-row items-center justify-center"
        >
          <Ionicons name="log-in-outline" size={20} color="white" />
          <Text className="text-white font-medium ml-2">
            Login as Owner or Member
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Areas Section */}
      <View className="px-4 mt-6">
        <Text className="text-white text-lg font-semibold mb-3">
          Browse by Area
        </Text>
        <View className="flex-row flex-wrap">
          {areas.map((area) => (
            <TouchableOpacity
              key={area.id}
              onPress={() => handleAreaSelect(area)}
              className="bg-dark-800 rounded-xl px-4 py-3 mr-2 mb-2"
            >
              <Text className="text-white font-medium">{area.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {areas.length === 0 && !loading && (
          <Text className="text-dark-400">No areas available</Text>
        )}
      </View>

      {/* Featured Messes */}
      <View className="px-4 mt-6">
        <Text className="text-white text-lg font-semibold mb-3">
          Featured Messes
        </Text>
        {featuredMesses.map((mess) => (
          <TouchableOpacity
            key={mess.id}
            onPress={() => handleMessSelect(mess)}
            className="bg-dark-800 rounded-2xl p-4 mb-3"
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-xl bg-primary-600/30 items-center justify-center">
                <Text className="text-primary-400 text-xl font-bold">
                  {mess.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white font-semibold text-lg">{mess.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location" size={14} color="#94a3b8" />
                  <Text className="text-dark-400 ml-1">{mess.areas?.name}</Text>
                </View>
                {mess.tagline && (
                  <Text className="text-dark-500 text-sm mt-1" numberOfLines={1}>
                    {mess.tagline}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>
        ))}
        {featuredMesses.length === 0 && !loading && (
          <View className="items-center py-8">
            <Ionicons name="storefront-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4">No messes available yet</Text>
          </View>
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};

export default GuestHomeScreen;
