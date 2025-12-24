import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const MessProfileScreen = ({ route }) => {
  const { mess: contextMess } = useAuth();
  const mess = route?.params?.mess || contextMess;

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

  if (!mess) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <Ionicons name="storefront-outline" size={48} color="#475569" />
        <Text className="text-dark-400 mt-4">No mess assigned yet</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950">
      {/* Header */}
      <View className="h-48 bg-dark-800 items-center justify-center">
        <View className="w-24 h-24 rounded-full bg-primary-600/30 items-center justify-center">
          <Text className="text-primary-400 text-4xl font-bold">
            {mess.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="px-4 -mt-8">
        <View className="bg-dark-800 rounded-2xl p-5">
          <Text className="text-white text-2xl font-bold mb-1">{mess.name}</Text>
          {mess.tagline && (
            <Text className="text-dark-300 mb-3">{mess.tagline}</Text>
          )}

          <View className="flex-row items-center mb-4">
            <View className="bg-primary-600/20 px-3 py-1 rounded-full flex-row items-center">
              <Ionicons name="location" size={14} color="#a855f7" />
              <Text className="text-primary-400 ml-1">{mess.areas?.name || 'Pune'}</Text>
            </View>
          </View>

          {mess.speciality && (
            <View className="mb-4">
              <Text className="text-dark-400 text-sm mb-1">Speciality</Text>
              <Text className="text-white">{mess.speciality}</Text>
            </View>
          )}

          {mess.address && (
            <View className="mb-4">
              <Text className="text-dark-400 text-sm mb-1">Address</Text>
              <Text className="text-white">{mess.address}</Text>
            </View>
          )}

          <View className="flex-row mt-2">
            {mess.contact_number && (
              <TouchableOpacity
                onPress={callMess}
                className="flex-1 bg-success/20 rounded-xl py-3 flex-row items-center justify-center mr-2"
              >
                <Ionicons name="call" size={20} color="#22c55e" />
                <Text className="text-success font-medium ml-2">Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={openMaps}
              className="flex-1 bg-primary-600/20 rounded-xl py-3 flex-row items-center justify-center ml-2"
            >
              <Ionicons name="navigate" size={20} color="#a855f7" />
              <Text className="text-primary-400 font-medium ml-2">Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contact */}
      <View className="px-4 mt-6">
        <Text className="text-dark-400 text-sm font-medium mb-2 px-1">CONTACT</Text>
        <View className="bg-dark-800 rounded-2xl p-4">
          {mess.contact_number && (
            <View className="flex-row items-center py-2">
              <Ionicons name="call" size={20} color="#94a3b8" />
              <Text className="text-white ml-3">{mess.contact_number}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
};

export default MessProfileScreen;
