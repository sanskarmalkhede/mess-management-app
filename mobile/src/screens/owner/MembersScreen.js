import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, differenceInDays } from 'date-fns';

const MembersScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!mess?.id) return;

    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*, profiles:user_id(name, email, phone, temp_password)')
        .eq('mess_id', mess.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [mess?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const getFilteredMembers = () => {
    let filtered = members;

    if (filter === 'active') {
      filtered = filtered.filter((m) => m.status === 'active');
    } else if (filter === 'expiring') {
      const today = new Date();
      filtered = filtered.filter((m) => {
        const daysLeft = differenceInDays(new Date(m.end_date), today);
        return m.status === 'active' && daysLeft <= 5 && daysLeft >= 0;
      });
    } else if (filter === 'expired') {
      filtered = filtered.filter((m) => m.status === 'expired');
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.profiles?.name?.toLowerCase().includes(searchLower) ||
          m.profiles?.email?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const getMemberStatus = (member) => {
    const today = new Date();
    const endDate = new Date(member.end_date);
    const daysLeft = differenceInDays(endDate, today);

    if (member.status === 'expired') {
      return { label: 'Expired', color: 'bg-red-500/20', textColor: 'text-red-400' };
    }
    if (daysLeft <= 5 && daysLeft >= 0) {
      return { label: `${daysLeft}d left`, color: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
    }
    return { label: 'Active', color: 'bg-green-500/20', textColor: 'text-green-400' };
  };

  const renderMember = ({ item }) => {
    const status = getMemberStatus(item);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MemberDetail', { membership: item })}
        className="bg-dark-800 rounded-2xl p-4 mb-3 mx-4"
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-600/30 items-center justify-center">
            <Text className="text-primary-400 font-bold text-lg">
              {item.profiles?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">{item.profiles?.name || 'Unknown'}</Text>
            <Text className="text-dark-400 text-sm">{item.profiles?.phone || item.profiles?.email}</Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${status.color}`}>
            <Text className={`text-xs font-medium ${status.textColor}`}>{status.label}</Text>
          </View>
        </View>

        {item.profiles?.temp_password && (
          <View className="mt-3 pt-3 border-t border-dark-700 flex-row items-center">
            <Ionicons name="key-outline" size={14} color="#94a3b8" />
            <Text className="text-dark-400 text-sm ml-2">Temp: </Text>
            <Text className="text-primary-400 font-mono">{item.profiles.temp_password}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredMembers = getFilteredMembers();

  return (
    <View className="flex-1 bg-dark-950">
      {/* Search & Filters */}
      <View className="px-4 py-3">
        <View className="bg-dark-800 rounded-xl flex-row items-center px-4 mb-3">
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search members..."
            placeholderTextColor="#475569"
            className="flex-1 py-3 px-3 text-white"
          />
        </View>

        <View className="flex-row">
          {['all', 'active', 'expiring', 'expired'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full mr-2 ${filter === f ? 'bg-primary-600' : 'bg-dark-700'}`}
            >
              <Text className={filter === f ? 'text-white font-medium' : 'text-dark-300'}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4">No members found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddMember')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default MembersScreen;
