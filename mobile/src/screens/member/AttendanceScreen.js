import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const AttendanceScreen = () => {
  const { membership } = useAuth();
  const [attendance, setAttendance] = useState({ lunch: null, dinner: null });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const canMarkLunch = membership?.meals_per_day === 'lunch' || membership?.meals_per_day === 'both';
  const canMarkDinner = membership?.meals_per_day === 'dinner' || membership?.meals_per_day === 'both';

  const fetchAttendance = useCallback(async () => {
    if (!membership?.id) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('membership_id', membership.id)
        .eq('attendance_date', today);

      if (error) throw error;

      const lunchRecord = data?.find((a) => a.meal_type === 'lunch');
      const dinnerRecord = data?.find((a) => a.meal_type === 'dinner');

      setAttendance({ lunch: lunchRecord, dinner: dinnerRecord });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [membership?.id, today]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const markAttendance = async (mealType) => {
    if (!membership?.id) return;

    const existingRecord = attendance[mealType];

    if (existingRecord?.is_present) {
      Alert.alert('Already Checked In', `You've already marked your ${mealType} attendance.`);
      return;
    }

    try {
      if (existingRecord) {
        await supabase
          .from('attendance')
          .update({ is_present: true, marked_by: 'member' })
          .eq('id', existingRecord.id);
      } else {
        await supabase.from('attendance').insert({
          membership_id: membership.id,
          attendance_date: today,
          meal_type: mealType,
          is_present: true,
          marked_by: 'member',
        });
      }

      setAttendance((prev) => ({
        ...prev,
        [mealType]: { ...prev[mealType], is_present: true, marked_by: 'member' },
      }));

      Alert.alert('Success!', `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} attendance marked.`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const MealCard = ({ type, emoji, label, canMark, record }) => {
    const isPresent = record?.is_present;

    return (
      <View className={`bg-dark-800 rounded-2xl p-5 mb-4 ${!canMark ? 'opacity-50' : ''}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">{emoji}</Text>
            <Text className="text-white text-xl font-semibold">{label}</Text>
          </View>
          {isPresent ? (
            <View className="bg-green-500/20 px-3 py-1 rounded-full">
              <Text className="text-green-400 font-medium">✓ Present</Text>
            </View>
          ) : (
            <View className="bg-dark-700 px-3 py-1 rounded-full">
              <Text className="text-dark-400">Not marked</Text>
            </View>
          )}
        </View>

        {canMark && !isPresent && (
          <TouchableOpacity
            onPress={() => markAttendance(type)}
            className="bg-primary-600 rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Check In for {label}</Text>
          </TouchableOpacity>
        )}

        {isPresent && (
          <View className="bg-green-500/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="checkmark-done" size={20} color="#22c55e" />
            <Text className="text-green-400 ml-2">
              Marked by {record?.marked_by === 'member' ? 'you' : 'owner'}
            </Text>
          </View>
        )}

        {!canMark && (
          <Text className="text-dark-500 text-center">Not included in your plan</Text>
        )}
      </View>
    );
  };

  if (membership?.status !== 'active') {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4">Membership Inactive</Text>
        <Text className="text-dark-400 text-center mt-2">
          Your membership has expired. Contact your mess owner to renew.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-dark-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="px-4 pt-4">
        <View className="bg-dark-800 rounded-xl p-3 mb-4 flex-row items-center justify-center">
          <Ionicons name="calendar" size={18} color="#a855f7" />
          <Text className="text-white font-medium ml-2">
            {format(new Date(), 'EEEE, dd MMM yyyy')}
          </Text>
        </View>

        <MealCard
          type="lunch"
          emoji="🌞"
          label="Lunch"
          canMark={canMarkLunch}
          record={attendance.lunch}
        />

        <MealCard
          type="dinner"
          emoji="🌙"
          label="Dinner"
          canMark={canMarkDinner}
          record={attendance.dinner}
        />
      </View>
    </ScrollView>
  );
};

export default AttendanceScreen;
