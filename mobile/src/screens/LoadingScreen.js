import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 bg-dark-950 items-center justify-center">
      <ActivityIndicator size="large" color="#a855f7" />
      <Text className="text-dark-400 mt-4">Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
