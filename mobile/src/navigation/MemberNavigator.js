import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Member Screens
import FeedScreen from '../screens/member/FeedScreen';
import MessProfileScreen from '../screens/member/MessProfileScreen';
import AttendanceScreen from '../screens/member/AttendanceScreen';
import PollsScreen from '../screens/member/PollsScreen';
import ProfileScreen from '../screens/member/ProfileScreen';

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
  <Stack.Navigator screenOptions={{ headerStyle, headerTitleStyle, headerTintColor: '#fff' }}>
    <Stack.Screen name="FeedMain" component={FeedScreen} options={{ title: "Today's Menu" }} />
    <Stack.Screen name="MessProfileView" component={MessProfileScreen} options={{ title: 'Mess Profile' }} />
  </Stack.Navigator>
);

const MemberNavigator = () => {
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
          if (route.name === 'Feed') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Polls') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedStack} />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ headerShown: true, headerStyle, headerTitleStyle, title: 'My Attendance' }}
      />
      <Tab.Screen 
        name="Polls" 
        component={PollsScreen}
        options={{ headerShown: true, headerStyle, headerTitleStyle, title: 'Polls' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: true, headerStyle, headerTitleStyle, title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MemberNavigator;
