import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation }) => {
  const { profile, mess } = useAuth();
  const [stats, setStats] = useState({
    activeMembers: 0,
    lunchToday: 0,
    dinnerToday: 0,
    expiringCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

      // Active members
      const { count: activeCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('mess_id', mess.id)
        .eq('status', 'active');

      // Today's lunch attendance
      const { count: lunchCount } = await supabase
        .from('attendance')
        .select('*, memberships!inner(*)', { count: 'exact', head: true })
        .eq('memberships.mess_id', mess.id)
        .eq('attendance_date', today)
        .eq('meal_type', 'lunch')
        .eq('is_present', true);

      // Today's dinner attendance
      const { count: dinnerCount } = await supabase
        .from('attendance')
        .select('*, memberships!inner(*)', { count: 'exact', head: true })
        .eq('memberships.mess_id', mess.id)
        .eq('attendance_date', today)
        .eq('meal_type', 'dinner')
        .eq('is_present', true);

      // Expiring memberships
      const { count: expiringCount } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('mess_id', mess.id)
        .eq('status', 'active')
        .gte('end_date', today)
        .lte('end_date', format(fiveDaysFromNow, 'yyyy-MM-dd'));

      setStats({
        activeMembers: activeCount || 0,
        lunchToday: lunchCount || 0,
        dinnerToday: dinnerCount || 0,
        expiringCount: expiringCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [mess?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-dark-800 rounded-2xl p-4 flex-1"
      style={{ minWidth: '45%' }}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3`} style={{ backgroundColor: `${color}20` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-white">{value}</Text>
      <Text className="text-dark-400 text-sm mt-1">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-dark-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      {/* Header */}
      <LinearGradient colors={['#7c3aed', '#9333ea']} className="px-5 pt-12 pb-6 rounded-b-3xl">
        <Text className="text-white/80">Welcome back,</Text>
        <Text className="text-white text-2xl font-bold">{profile?.name || 'Owner'}</Text>
        {mess && (
          <View className="mt-3 bg-white/20 self-start px-3 py-1.5 rounded-full flex-row items-center">
            <Ionicons name="storefront" size={14} color="white" />
            <Text className="text-white ml-2">{mess.name}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View className="px-4 -mt-4">
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon="people"
            label="Active Members"
            value={stats.activeMembers}
            color="#22c55e"
            onPress={() => navigation.navigate('Members')}
          />
          <StatCard
            icon="sunny"
            label="Lunch Today"
            value={stats.lunchToday}
            color="#f59e0b"
            onPress={() => navigation.navigate('Members', { screen: 'Attendance' })}
          />
          <StatCard
            icon="moon"
            label="Dinner Today"
            value={stats.dinnerToday}
            color="#3b82f6"
            onPress={() => navigation.navigate('Members', { screen: 'Attendance' })}
          />
          <StatCard
            icon="warning"
            label="Expiring Soon"
            value={stats.expiringCount}
            color="#ef4444"
            onPress={() => navigation.navigate('Members', { screen: 'Alerts' })}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mt-6">
        <Text className="text-white text-lg font-semibold mb-3">Quick Actions</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate('Members', { screen: 'AddMember' })}
            className="flex-1 bg-primary-600/20 rounded-2xl p-4 items-center"
          >
            <Ionicons name="person-add" size={24} color="#a855f7" />
            <Text className="text-primary-400 mt-2 font-medium">Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu', { screen: 'CreateMenu' })}
            className="flex-1 bg-primary-600/20 rounded-2xl p-4 items-center"
          >
            <Ionicons name="restaurant" size={24} color="#a855f7" />
            <Text className="text-primary-400 mt-2 font-medium">Post Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Polls', { screen: 'CreatePoll' })}
            className="flex-1 bg-primary-600/20 rounded-2xl p-4 items-center"
          >
            <Ionicons name="bar-chart" size={24} color="#a855f7" />
            <Text className="text-primary-400 mt-2 font-medium">New Poll</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};

export default DashboardScreen;
