import React, { useState } from 'react';
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
import { format, addMonths, addDays } from 'date-fns';

const AddMemberScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planType, setPlanType] = useState('monthly');
  const [mealsPerDay, setMealsPerDay] = useState('both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdMember, setCreatedMember] = useState(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const getEndDate = () => {
    const startDate = new Date();
    if (planType === 'monthly') return addMonths(startDate, 1);
    if (planType === 'quarterly') return addMonths(startDate, 3);
    return addDays(startDate, 30);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tempPassword = generatePassword();
      const startDate = new Date();
      const endDate = getEndDate();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: tempPassword,
        options: { data: { name, phone } },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Failed to create user');

      // Update profile with temp password
      await supabase
        .from('profiles')
        .update({ temp_password: tempPassword, phone })
        .eq('id', userId);

      // Create user role
      await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'member',
        mess_id: mess.id,
      });

      // Create membership
      await supabase.from('memberships').insert({
        user_id: userId,
        mess_id: mess.id,
        plan_type: planType,
        meals_per_day: mealsPerDay,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        status: 'active',
      });

      setCreatedMember({ name, email, tempPassword });
    } catch (err) {
      console.error('Error creating member:', err);
      setError(err.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  if (createdMember) {
    return (
      <View className="flex-1 bg-dark-950 px-4 items-center justify-center">
        <View className="bg-success/20 rounded-full p-6 mb-6">
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">Member Added!</Text>
        <Text className="text-dark-400 text-center mb-6">Share these credentials with {createdMember.name}</Text>

        <View className="bg-dark-800 rounded-2xl p-5 w-full mb-6">
          <View className="mb-4">
            <Text className="text-dark-400 text-sm">Email</Text>
            <Text className="text-white font-medium">{createdMember.email}</Text>
          </View>
          <View>
            <Text className="text-dark-400 text-sm">Temporary Password</Text>
            <Text className="text-primary-400 text-xl font-bold font-mono">{createdMember.tempPassword}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary-600 rounded-xl py-4 px-8"
        >
          <Text className="text-white font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark-950"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Name */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Full Name *</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor="#475569"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Email *</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="member@email.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Phone</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 9876543210"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Plan Type */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Plan Type</Text>
          <View className="bg-dark-800 rounded-xl">
            <Picker
              selectedValue={planType}
              onValueChange={setPlanType}
              style={{ color: 'white' }}
              dropdownIconColor="#a855f7"
            >
              <Picker.Item label="Monthly (30 days)" value="monthly" />
              <Picker.Item label="Quarterly (90 days)" value="quarterly" />
              <Picker.Item label="Custom" value="custom" />
            </Picker>
          </View>
        </View>

        {/* Meals Per Day */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Meals</Text>
          <View className="flex-row">
            {['lunch', 'dinner', 'both'].map((meal) => (
              <TouchableOpacity
                key={meal}
                onPress={() => setMealsPerDay(meal)}
                className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                  mealsPerDay === meal ? 'bg-primary-600' : 'bg-dark-800'
                }`}
              >
                <Text className={mealsPerDay === meal ? 'text-white font-medium' : 'text-dark-300'}>
                  {meal === 'lunch' ? '🌞 Lunch' : meal === 'dinner' ? '🌙 Dinner' : '🍽️ Both'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-primary-600 rounded-xl py-4 mt-4 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Creating...' : 'Add Member'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddMemberScreen;
