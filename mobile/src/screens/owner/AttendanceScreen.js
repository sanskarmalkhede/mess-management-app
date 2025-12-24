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
import { format } from 'date-fns';

const AttendanceScreen = () => {
  const { mess } = useAuth();
  const [members, setMembers] = useState([]);
  const [mealType, setMealType] = useState('lunch');
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState({});
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    if (!mess?.id) return;

    try {
      // Fetch active memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select('*, profiles:user_id(name)')
        .eq('mess_id', mess.id)
        .eq('status', 'active');

      // Filter by meal eligibility
      const eligible = (memberships || []).filter(
        (m) => m.meals_per_day === mealType || m.meals_per_day === 'both'
      );

      setMembers(eligible);

      // Fetch today's attendance
      const membershipIds = eligible.map((m) => m.id);
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', today)
        .eq('meal_type', mealType)
        .in('membership_id', membershipIds);

      const attendanceMap = {};
      (attendanceData || []).forEach((a) => {
        attendanceMap[a.membership_id] = a;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, [mess?.id, mealType, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleAttendance = async (membership) => {
    const existingRecord = attendance[membership.id];
    const newStatus = !existingRecord?.is_present;

    try {
      if (existingRecord) {
        await supabase
          .from('attendance')
          .update({ is_present: newStatus, marked_by: 'owner' })
          .eq('id', existingRecord.id);
      } else {
        await supabase.from('attendance').insert({
          membership_id: membership.id,
          attendance_date: today,
          meal_type: mealType,
          is_present: true,
          marked_by: 'owner',
        });
      }

      setAttendance((prev) => ({
        ...prev,
        [membership.id]: {
          ...existingRecord,
          is_present: newStatus,
          marked_by: 'owner',
        },
      }));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const presentCount = Object.values(attendance).filter((a) => a?.is_present).length;

  const renderMember = ({ item }) => {
    const record = attendance[item.id];
    const isPresent = record?.is_present;
    const markedBy = record?.marked_by;

    return (
      <TouchableOpacity
        onPress={() => toggleAttendance(item)}
        className={`flex-row items-center p-4 mb-2 mx-4 rounded-2xl ${
          isPresent ? 'bg-green-500/20' : 'bg-dark-800'
        }`}
      >
        <View className="flex-1">
          <Text className="text-white font-medium">{item.profiles?.name || 'Unknown'}</Text>
          {markedBy && (
            <Text className="text-dark-400 text-xs mt-1">
              Marked by {markedBy === 'member' ? 'self' : 'owner'}
            </Text>
          )}
        </View>
        <View className={`w-8 h-8 rounded-full items-center justify-center ${isPresent ? 'bg-green-500' : 'bg-dark-600'}`}>
          {isPresent ? (
            <Ionicons name="checkmark" size={18} color="white" />
          ) : (
            <View className="w-2 h-2 rounded-full bg-dark-400" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-dark-950">
      {/* Meal Toggle */}
      <View className="flex-row mx-4 mt-4 bg-dark-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setMealType('lunch')}
          className={`flex-1 py-3 rounded-lg items-center ${mealType === 'lunch' ? 'bg-primary-600' : ''}`}
        >
          <Text className={mealType === 'lunch' ? 'text-white font-medium' : 'text-dark-400'}>
            🌞 Lunch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMealType('dinner')}
          className={`flex-1 py-3 rounded-lg items-center ${mealType === 'dinner' ? 'bg-primary-600' : ''}`}
        >
          <Text className={mealType === 'dinner' ? 'text-white font-medium' : 'text-dark-400'}>
            🌙 Dinner
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-dark-400">{format(new Date(), 'EEEE, dd MMM')}</Text>
        <View className="bg-primary-600/20 px-3 py-1 rounded-full">
          <Text className="text-primary-400 font-medium">
            {presentCount} / {members.length} present
          </Text>
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
          <View className="items-center py-20">
            <Ionicons name="people-outline" size={48} color="#475569" />
            <Text className="text-dark-400 mt-4">No eligible members for {mealType}</Text>
          </View>
        }
      />
    </View>
  );
};

export default AttendanceScreen;
