import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { format, differenceInDays } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
  const { profile, membership, mess, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const getMembershipStatus = () => {
    if (!membership) return null;

    const today = new Date();
    const endDate = new Date(membership.end_date);
    const daysLeft = differenceInDays(endDate, today);

    if (membership.status === 'expired') {
      return { label: 'Expired', color: 'bg-red-500/20', textColor: 'text-red-400' };
    }
    if (daysLeft <= 5 && daysLeft >= 0) {
      return { label: `${daysLeft} days left`, color: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
    }
    return { label: 'Active', color: 'bg-green-500/20', textColor: 'text-green-400' };
  };

  const status = getMembershipStatus();
  const mealLabel = membership?.meals_per_day === 'lunch' ? '🌞 Lunch Only' :
                    membership?.meals_per_day === 'dinner' ? '🌙 Dinner Only' : '🍽️ Both Meals';

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Profile Card */}
      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl p-5">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-primary-600/30 items-center justify-center mb-4">
            <Text className="text-primary-400 text-3xl font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text className="text-white text-xl font-semibold">{profile?.name || 'Member'}</Text>
          <Text className="text-dark-400">{profile?.email}</Text>
          {profile?.phone && <Text className="text-dark-400">{profile.phone}</Text>}
        </View>
      </View>

      {/* Mess Info */}
      {mess && (
        <View className="mx-4 mt-4 bg-dark-800 rounded-2xl p-4">
          <Text className="text-dark-400 text-sm mb-3">MY MESS</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-primary-600/30 items-center justify-center">
              <Text className="text-primary-400 font-bold">
                {mess.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-white font-medium">{mess.name}</Text>
              <Text className="text-dark-400 text-sm">{mess.areas?.name}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Membership Info */}
      {membership && (
        <View className="mx-4 mt-4 bg-dark-800 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-dark-400 text-sm">MEMBERSHIP</Text>
            {status && (
              <View className={`px-3 py-1 rounded-full ${status.color}`}>
                <Text className={`text-xs font-medium ${status.textColor}`}>{status.label}</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Plan</Text>
            <Text className="text-white capitalize">{membership.plan_type}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Meals</Text>
            <Text className="text-white">{mealLabel}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2 border-b border-dark-700">
            <Text className="text-dark-400">Start Date</Text>
            <Text className="text-white">{format(new Date(membership.start_date), 'dd MMM yyyy')}</Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-dark-400">End Date</Text>
            <Text className="text-white">{format(new Date(membership.end_date), 'dd MMM yyyy')}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={() => navigation.navigate('ChangePassword')}
          className="flex-row items-center py-4 px-4"
        >
          <View className="w-10 h-10 rounded-xl bg-dark-700 items-center justify-center">
            <Ionicons name="key-outline" size={20} color="#a855f7" />
          </View>
          <Text className="flex-1 text-white ml-3">Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center py-4 px-4"
        >
          <View className="w-10 h-10 rounded-xl bg-red-500/20 items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <Text className="flex-1 text-red-400 ml-3">Sign Out</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};

export default ProfileScreen;
