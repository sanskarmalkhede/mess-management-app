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

const CreateMenuScreen = ({ navigation }) => {
  const { mess } = useAuth();
  const [mealType, setMealType] = useState('lunch');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState(['']);
  const [isVeg, setIsVeg] = useState(true);
  const [price, setPrice] = useState('');
  const [expiryHours, setExpiryHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => setItems([...items, '']);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    const filteredItems = items.filter((i) => i.trim());

    if (!title || filteredItems.length === 0) {
      setError('Title and at least one menu item are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('menu_posts').insert({
        mess_id: mess.id,
        meal_type: mealType,
        title,
        items: filteredItems,
        is_veg: isVeg,
        price: price ? parseFloat(price) : null,
        visible_from: new Date().toISOString(),
        expiry_time: addHours(new Date(), expiryHours).toISOString(),
      });

      if (insertError) throw insertError;
      navigation.goBack();
    } catch (err) {
      console.error('Error creating menu:', err);
      setError(err.message || 'Failed to create menu');
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
        {/* Meal Type */}
        <View className="flex-row bg-dark-800 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setMealType('lunch')}
            className={`flex-1 py-3 rounded-lg items-center ${mealType === 'lunch' ? 'bg-primary-600' : ''}`}
          >
            <Text className={mealType === 'lunch' ? 'text-white font-medium' : 'text-dark-400'}>
              🌞 Lunch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMealType('dinner')}
            className={`flex-1 py-3 rounded-lg items-center ${mealType === 'dinner' ? 'bg-primary-600' : ''}`}
          >
            <Text className={mealType === 'dinner' ? 'text-white font-medium' : 'text-dark-400'}>
              🌙 Dinner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Menu Title</Text>
          <View className="bg-dark-800 rounded-xl px-4">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Today's Special Thali"
              placeholderTextColor="#475569"
              className="py-4 text-white"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Menu Items</Text>
          {items.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View className="flex-1 bg-dark-800 rounded-xl px-4 flex-row items-center">
                <TextInput
                  value={item}
                  onChangeText={(text) => updateItem(index, text)}
                  placeholder={`Item ${index + 1}`}
                  placeholderTextColor="#475569"
                  className="flex-1 py-3 text-white"
                />
              </View>
              {items.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  className="ml-2 p-2"
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            onPress={addItem}
            className="flex-row items-center justify-center py-3 bg-dark-800 rounded-xl mt-2"
          >
            <Ionicons name="add-circle-outline" size={20} color="#a855f7" />
            <Text className="text-primary-400 ml-2">Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Veg / Non-Veg */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Type</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setIsVeg(true)}
              className={`flex-1 py-3 rounded-xl mr-2 items-center ${isVeg ? 'bg-green-600' : 'bg-dark-800'}`}
            >
              <Text className={isVeg ? 'text-white font-medium' : 'text-dark-400'}>🌱 Veg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsVeg(false)}
              className={`flex-1 py-3 rounded-xl ml-2 items-center ${!isVeg ? 'bg-red-600' : 'bg-dark-800'}`}
            >
              <Text className={!isVeg ? 'text-white font-medium' : 'text-dark-400'}>🍖 Non-Veg</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Price (Optional)</Text>
          <View className="bg-dark-800 rounded-xl px-4 flex-row items-center">
            <Text className="text-dark-400">₹</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="100"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              className="flex-1 py-4 px-2 text-white"
            />
          </View>
        </View>

        {/* Expiry Hours */}
        <View className="mb-4">
          <Text className="text-dark-400 text-sm mb-2">Visible For</Text>
          <View className="flex-row">
            {[3, 6, 12, 24].map((hours) => (
              <TouchableOpacity
                key={hours}
                onPress={() => setExpiryHours(hours)}
                className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                  expiryHours === hours ? 'bg-primary-600' : 'bg-dark-800'
                }`}
              >
                <Text className={expiryHours === hours ? 'text-white font-medium' : 'text-dark-400'}>
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
            {loading ? 'Posting...' : 'Post Menu'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateMenuScreen;
