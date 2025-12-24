import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { profile, mess, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4"
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${danger ? 'bg-red-500/20' : 'bg-dark-700'}`}>
        <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#a855f7'} />
      </View>
      <Text className={`flex-1 ml-3 ${danger ? 'text-red-400' : 'text-white'}`}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Profile Card */}
      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl p-5">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-primary-600/30 items-center justify-center">
            <Text className="text-primary-400 text-2xl font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-lg font-semibold">{profile?.name || 'Owner'}</Text>
            <Text className="text-dark-400">{profile?.email}</Text>
          </View>
        </View>
      </View>

      {/* Mess Info */}
      {mess && (
        <View className="mx-4 mt-4 bg-dark-800 rounded-2xl p-4">
          <View className="flex-row items-center">
            <Ionicons name="storefront" size={20} color="#a855f7" />
            <Text className="text-white font-medium ml-2">{mess.name}</Text>
          </View>
          {mess.areas?.name && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={16} color="#64748b" />
              <Text className="text-dark-400 ml-2">{mess.areas.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Menu Items */}
      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl overflow-hidden">
        <MenuItem
          icon="storefront-outline"
          label="Edit Mess Profile"
          onPress={() => navigation.navigate('MessProfile')}
        />
        <View className="h-px bg-dark-700 mx-4" />
        <MenuItem
          icon="key-outline"
          label="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      {/* Sign Out */}
      <View className="mx-4 mt-4 bg-dark-800 rounded-2xl overflow-hidden">
        <MenuItem
          icon="log-out-outline"
          label="Sign Out"
          onPress={handleSignOut}
          danger
        />
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};

export default SettingsScreen;
