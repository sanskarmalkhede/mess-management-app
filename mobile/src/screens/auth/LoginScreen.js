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
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={['#7c3aed', '#9333ea', '#a855f7']}
          className="pt-20 pb-12 px-6 rounded-b-3xl"
        >
          <Text className="text-white text-3xl font-bold mb-2">Welcome Back!</Text>
          <Text className="text-white/80">
            Login to manage your mess or check your meals
          </Text>
        </LinearGradient>

        {/* Form */}
        <View className="px-6 pt-8 flex-1">
          <View className="mb-4">
            <Text className="text-dark-400 text-sm mb-2 ml-1">Email</Text>
            <View className="bg-dark-800 rounded-xl flex-row items-center px-4">
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 py-4 px-3 text-white"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-dark-400 text-sm mb-2 ml-1">Password</Text>
            <View className="bg-dark-800 rounded-xl flex-row items-center px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPassword}
                className="flex-1 py-4 px-3 text-white"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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
            onPress={handleLogin}
            disabled={loading}
            className={`bg-primary-600 rounded-xl py-4 mt-4 ${loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <Text className="text-dark-500 text-center mt-6 text-sm">
            Contact your mess owner for login credentials
          </Text>

          {/* Guest Access */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Guest')}
            className="mt-6 py-4 flex-row items-center justify-center"
          >
            <Ionicons name="eye-outline" size={20} color="#a855f7" />
            <Text className="text-primary-400 font-medium ml-2">
              Continue as Guest
            </Text>
          </TouchableOpacity>
          <Text className="text-dark-600 text-center text-xs">
            Browse messes and menus without signing in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
