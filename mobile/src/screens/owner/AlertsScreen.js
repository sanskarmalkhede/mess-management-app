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
import { format, differenceInDays } from 'date-fns';

const AlertsScreen = () => {
  const { mess } = useAuth();
  const [members, setMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpiringMembers = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const today = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(today.getDate() + 5);

      const { data, error } = await supabase
        .from('memberships')
        .select('*, profiles:user_id(name, email, phone)')
        .eq('mess_id', mess.id)
        .eq('status', 'active')
        .gte('end_date', format(today, 'yyyy-MM-dd'))
        .lte('end_date', format(fiveDaysFromNow, 'yyyy-MM-dd'))
        .order('end_date');

      if (error) throw error;

      const formatted = (data || []).map((m) => ({
        ...m,
        days_remaining: differenceInDays(new Date(m.end_date), today),
      }));

      setMembers(formatted);
    } catch (error) {
      console.error('Error fetching expiring members:', error);
    } finally {
      setLoading(false);
    }
  }, [mess?.id]);

  useEffect(() => {
    fetchExpiringMembers();
  }, [fetchExpiringMembers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpiringMembers();
    setRefreshing(false);
  };

  const getDaysColor = (days) => {
    if (days <= 1) return { bg: 'bg-red-500/20', text: 'text-red-400' };
    if (days <= 3) return { bg: 'bg-orange-500/20', text: 'text-orange-400' };
    return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
  };

  const renderMember = ({ item }) => {
    const colors = getDaysColor(item.days_remaining);

    return (
      <View className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center">
            <Ionicons name="warning" size={24} color="#ef4444" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">{item.profiles?.name || 'Unknown'}</Text>
            <Text className="text-dark-400 text-sm">{item.profiles?.phone || item.profiles?.email}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
            <Text className={`font-bold ${colors.text}`}>
              {item.days_remaining === 0 ? 'Today' : 
               item.days_remaining === 1 ? '1 day' : 
               `${item.days_remaining} days`}
            </Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-dark-700 flex-row items-center justify-between">
          <Text className="text-dark-400 text-sm">
            Expires: {format(new Date(item.end_date), 'dd MMM yyyy')}
          </Text>
          <View className="bg-primary-600/20 px-3 py-1 rounded-lg flex-row items-center">
            <Ionicons name="refresh" size={14} color="#a855f7" />
            <Text className="text-primary-400 text-sm ml-1">Renew</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-dark-950">
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text className="text-red-400 font-semibold ml-2">
              {members.length} membership{members.length !== 1 ? 's' : ''} expiring within 5 days
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="bg-success/20 rounded-full p-4 mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>
            <Text className="text-white text-lg font-semibold">All Clear!</Text>
            <Text className="text-dark-400 mt-2 text-center">
              No memberships are expiring{'\n'}within the next 5 days
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default AlertsScreen;
