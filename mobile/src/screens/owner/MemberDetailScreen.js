import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';

const MemberDetailScreen = ({ route, navigation }) => {
  const { membership } = route.params;
  const profile = membership.profiles;

  const today = new Date();
  const endDate = new Date(membership.end_date);
  const daysLeft = differenceInDays(endDate, today);

  const getStatusInfo = () => {
    if (membership.status === 'expired') {
      return { label: 'Expired', color: 'bg-red-500/20', textColor: 'text-red-400', icon: 'close-circle' };
    }
    if (daysLeft <= 5 && daysLeft >= 0) {
      return { label: `${daysLeft} days left`, color: 'bg-yellow-500/20', textColor: 'text-yellow-400', icon: 'warning' };
    }
    return { label: 'Active', color: 'bg-green-500/20', textColor: 'text-green-400', icon: 'checkmark-circle' };
  };

  const status = getStatusInfo();
  const mealLabel = membership.meals_per_day === 'lunch' ? '🌞 Lunch' :
                    membership.meals_per_day === 'dinner' ? '🌙 Dinner' : '🍽️ Both';

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Header */}
      <View className="items-center pt-6 pb-8">
        <View className="w-20 h-20 rounded-full bg-primary-600/30 items-center justify-center mb-4">
          <Text className="text-primary-400 text-3xl font-bold">
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold">{profile?.name || 'Unknown'}</Text>
        <View className={`mt-2 px-4 py-1.5 rounded-full flex-row items-center ${status.color}`}>
          <Ionicons name={status.icon} size={16} color={status.textColor.includes('red') ? '#ef4444' : status.textColor.includes('yellow') ? '#eab308' : '#22c55e'} />
          <Text className={`ml-1 font-medium ${status.textColor}`}>{status.label}</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View className="px-4">
        <Text className="text-dark-400 text-sm font-medium mb-2 px-1">CONTACT</Text>
        <View className="bg-dark-800 rounded-2xl p-4">
          {profile?.email && (
            <View className="flex-row items-center py-2">
              <Ionicons name="mail" size={20} color="#94a3b8" />
              <Text className="text-white ml-3">{profile.email}</Text>
            </View>
          )}
          {profile?.phone && (
            <View className="flex-row items-center py-2">
              <Ionicons name="call" size={20} color="#94a3b8" />
              <Text className="text-white ml-3">{profile.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Membership Details */}
      <View className="px-4 mt-6">
        <Text className="text-dark-400 text-sm font-medium mb-2 px-1">MEMBERSHIP</Text>
        <View className="bg-dark-800 rounded-2xl p-4">
          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Plan</Text>
            <Text className="text-white font-medium capitalize">{membership.plan_type}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Meals</Text>
            <Text className="text-white font-medium">{mealLabel}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Start Date</Text>
            <Text className="text-white">{format(new Date(membership.start_date), 'dd MMM yyyy')}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-dark-400">End Date</Text>
            <Text className="text-white">{format(endDate, 'dd MMM yyyy')}</Text>
          </View>
        </View>
      </View>

      {/* Temp Password */}
      {profile?.temp_password && (
        <View className="px-4 mt-6">
          <Text className="text-dark-400 text-sm font-medium mb-2 px-1">LOGIN CREDENTIALS</Text>
          <View className="bg-dark-800 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-dark-400 text-sm">Temporary Password</Text>
                <Text className="text-primary-400 text-lg font-bold font-mono mt-1">
                  {profile.temp_password}
                </Text>
              </View>
              <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                <Text className="text-yellow-400 text-xs">Not Changed</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
};

export default MemberDetailScreen;
