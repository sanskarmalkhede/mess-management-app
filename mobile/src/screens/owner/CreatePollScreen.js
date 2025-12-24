import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { addHours } from 'date-fns';

const CreatePollScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [targetMeal, setTargetMeal] = useState('lunch');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    const filteredOptions = options.filter((o) => o.trim());

    if (!title) {
      setError('Poll question is required');
      return;
    }

    if (filteredOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('polls').insert({
        mess_id: mess.id,
        target_meal: targetMeal,
        title,
        options: filteredOptions,
        voting_deadline: addHours(new Date(), deadlineHours).toISOString(),
        status: 'active',
      });

      if (insertError) throw insertError;
      navigation.goBack();
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err.message || 'Failed to create poll');
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
        {/* Target Meal */}
        <View className="flex-row bg-dark-800 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setTargetMeal('lunch')}
            className={`flex-1 py-3 rounded-lg items-center ${targetMeal === 'lunch' ? 'bg-primary-600' : ''}`}
          >
            <Text className={targetMeal === 'lunch' ? 'text-white font-medium' : 'text-dark-400'}>
              🌞 Lunch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTargetMeal('dinner')}
            className={`flex-1 py-3 rounded-lg items-center ${targetMeal === 'dinner' ? 'bg-primary-600' : ''}`}
          >
            <Text className={targetMeal === 'dinner' ? 'text-white font-medium' : 'text-dark-400'}>
              🌙 Dinner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Question */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Poll Question</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What should we cook tomorrow?"
              placeholderTextColor="#475569"
              className="py-4 text-white"
              multiline
            />
          </View>
        </View>

        {/* Options */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Options (2-5)</Text>
          {options.map((option, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View className="flex-1 bg-dark-800 rounded-xl px-4 flex-row items-center">
                <Text className="text-primary-400 mr-2">{index + 1}.</Text>
                <TextInput
                  value={option}
                  onChangeText={(text) => updateOption(index, text)}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor="#475569"
                  className="flex-1 py-3 text-white"
                />
              </View>
              {options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(index)} className="ml-2 p-2">
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {options.length < 5 && (
            <TouchableOpacity
              onPress={addOption}
              className="flex-row items-center justify-center py-3 bg-dark-800 rounded-xl mt-2"
            >
              <Ionicons name="add-circle-outline" size={20} color="#a855f7" />
              <Text className="text-primary-400 ml-2">Add Option</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Deadline */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Voting Deadline</Text>
          <View className="flex-row">
            {[6, 12, 24, 48].map((hours) => (
              <TouchableOpacity
                key={hours}
                onPress={() => setDeadlineHours(hours)}
                className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                  deadlineHours === hours ? 'bg-primary-600' : 'bg-dark-800'
                }`}
              >
                <Text className={deadlineHours === hours ? 'text-white font-medium' : 'text-dark-400'}>
                  {hours}h
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
            {loading ? 'Creating...' : 'Create Poll'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePollScreen;
