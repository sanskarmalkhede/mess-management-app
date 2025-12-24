import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Clear temp_password in profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ temp_password: null })
          .eq('id', user.id);
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center px-6">
        <View className="bg-success/20 rounded-full p-6 mb-6">
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">Success!</Text>
        <Text className="text-dark-400 text-center mb-8">
          Your password has been changed successfully
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-primary-600 rounded-xl py-4 px-8"
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={['#7c3aed', '#9333ea']}
          className="pt-16 pb-8 px-6 rounded-b-3xl"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Change Password</Text>
          <Text className="text-white/80 mt-1">Set a new secure password</Text>
        </LinearGradient>

        <View className="px-6 pt-8">
          <View className="mb-4">
            <Text className="text-dark-400 text-sm mb-2 ml-1">New Password</Text>
            <View className="bg-dark-800 rounded-xl flex-row items-center px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPasswords}
                className="flex-1 py-4 px-3 text-white"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-dark-400 text-sm mb-2 ml-1">Confirm New Password</Text>
            <View className="bg-dark-800 rounded-xl flex-row items-center px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPasswords}
                className="flex-1 py-4 px-3 text-white"
              />
              <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
                <Ionicons
                  name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            className={`bg-primary-600 rounded-xl py-4 mt-4 ${loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;
