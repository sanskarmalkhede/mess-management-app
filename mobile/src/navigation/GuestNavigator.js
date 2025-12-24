import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Guest Screens
import GuestHomeScreen from '../screens/guest/GuestHomeScreen';
import MessListScreen from '../screens/guest/MessListScreen';
import MessDetailScreen from '../screens/guest/MessDetailScreen';
import PublicFeedScreen from '../screens/guest/PublicFeedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  backgroundColor: '#0f172a',
  shadowColor: 'transparent',
  elevation: 0,
};

const headerTitleStyle = {
  color: '#fff',
  fontWeight: '600',
};

// Feed Stack
const FeedStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle,
      headerTitleStyle,
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen 
      name="PublicFeed" 
      component={PublicFeedScreen}
      options={{ title: 'Today\'s Menus' }}
    />
    <Stack.Screen 
      name="MessDetail" 
      component={MessDetailScreen}
      options={{ title: 'Mess Profile' }}
    />
  </Stack.Navigator>
);

// Explore Stack
const ExploreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle,
      headerTitleStyle,
      headerTintColor: '#fff',
    }}
  >
    <Stack.Screen 
      name="GuestHome" 
      component={GuestHomeScreen}
      options={{ title: 'Explore Messes' }}
    />
    <Stack.Screen 
      name="MessList" 
      component={MessListScreen}
      options={{ title: 'Messes in Area' }}
    />
    <Stack.Screen 
      name="MessDetailExplore" 
      component={MessDetailScreen}
      options={{ title: 'Mess Profile' }}
    />
  </Stack.Navigator>
);

const GuestNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'FeedTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'search' : 'search-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={FeedStack}
        options={{ tabBarLabel: 'Menus' }}
      />
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreStack}
        options={{ tabBarLabel: 'Explore' }}
      />
    </Tab.Navigator>
  );
};

export default GuestNavigator;
