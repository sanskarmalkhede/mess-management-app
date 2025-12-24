import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const MessProfileScreen = ({ navigation }) => {
  const { mess, refreshProfile } = useAuth();
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    name: mess?.name || '',
    tagline: mess?.tagline || '',
    speciality: mess?.speciality || '',
    address: mess?.address || '',
    contact_number: mess?.contact_number || '',
    area_id: mess?.area_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setAreas(data || []);
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Mess name is required');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('messes')
        .update({
          name: formData.name,
          tagline: formData.tagline,
          speciality: formData.speciality,
          address: formData.address,
          contact_number: formData.contact_number,
          area_id: formData.area_id,
        })
        .eq('id', mess.id);

      if (error) throw error;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating mess:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark-950"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {success && (
          <View className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text className="text-green-400 ml-2">Profile updated!</Text>
          </View>
        )}

        {/* Name */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Mess Name *</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your Mess Name"
              placeholderTextColor="#475569"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Area */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Area</Text>
          <View className="bg-dark-800 rounded-xl">
            <Picker
              selectedValue={formData.area_id}
              onValueChange={(value) => setFormData({ ...formData, area_id: value })}
              style={{ color: 'white' }}
              dropdownIconColor="#a855f7"
            >
              <Picker.Item label="Select area..." value="" />
              {areas.map((area) => (
                <Picker.Item key={area.id} label={area.name} value={area.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Tagline */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Tagline</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={formData.tagline}
              onChangeText={(text) => setFormData({ ...formData, tagline: text })}
              placeholder="Home-style Maharashtrian Food"
              placeholderTextColor="#475569"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Speciality */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Speciality</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={formData.speciality}
              onChangeText={(text) => setFormData({ ...formData, speciality: text })}
              placeholder="Unlimited thali, Pure veg..."
              placeholderTextColor="#475569"
              className="py-4 text-white"
              multiline
            />
          </View>
        </View>

        {/* Address */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Address</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Full address..."
              placeholderTextColor="#475569"
              className="py-4 text-white"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Contact */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Contact Number</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={formData.contact_number}
              onChangeText={(text) => setFormData({ ...formData, contact_number: text })}
              placeholder="+91 9876543210"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              className="py-4 text-white"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`bg-primary-600 rounded-xl py-4 mt-4 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MessProfileScreen;
