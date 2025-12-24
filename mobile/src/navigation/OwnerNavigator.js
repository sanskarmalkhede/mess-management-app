import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Owner Screens
import DashboardScreen from '../screens/owner/DashboardScreen';
import MembersScreen from '../screens/owner/MembersScreen';
import AddMemberScreen from '../screens/owner/AddMemberScreen';
import MemberDetailScreen from '../screens/owner/MemberDetailScreen';
import AttendanceScreen from '../screens/owner/AttendanceScreen';
import MenuPostScreen from '../screens/owner/MenuPostScreen';
import CreateMenuScreen from '../screens/owner/CreateMenuScreen';
import PollsScreen from '../screens/owner/PollsScreen';
import CreatePollScreen from '../screens/owner/CreatePollScreen';
import MessProfileScreen from '../screens/owner/MessProfileScreen';
import AlertsScreen from '../screens/owner/AlertsScreen';
import SettingsScreen from '../screens/owner/SettingsScreen';

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

// Members Stack
const MembersStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle, headerTitleStyle, headerTintColor: '#fff' }}>
    <Stack.Screen name="MembersList" component={MembersScreen} options={{ title: 'Members' }} />
    <Stack.Screen name="AddMember" component={AddMemberScreen} options={{ title: 'Add Member' }} />
    <Stack.Screen name="MemberDetail" component={MemberDetailScreen} options={{ title: 'Member Details' }} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: "Today's Attendance" }} />
    <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Expiring Soon' }} />
  </Stack.Navigator>
);

// Menu Stack
const MenuStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle, headerTitleStyle, headerTintColor: '#fff' }}>
    <Stack.Screen name="MenuPosts" component={MenuPostScreen} options={{ title: 'Menu Posts' }} />
    <Stack.Screen name="CreateMenu" component={CreateMenuScreen} options={{ title: 'Create Menu' }} />
  </Stack.Navigator>
);

// Polls Stack
const PollsStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle, headerTitleStyle, headerTintColor: '#fff' }}>
    <Stack.Screen name="PollsList" component={PollsScreen} options={{ title: 'Polls' }} />
    <Stack.Screen name="CreatePoll" component={CreatePollScreen} options={{ title: 'Create Poll' }} />
  </Stack.Navigator>
);

// Settings Stack
const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle, headerTitleStyle, headerTintColor: '#fff' }}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="MessProfile" component={MessProfileScreen} options={{ title: 'Edit Mess Profile' }} />
  </Stack.Navigator>
);

const OwnerNavigator = () => {
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
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Members') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Polls') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Members" component={MembersStack} />
      <Tab.Screen name="Menu" component={MenuStack} />
      <Tab.Screen name="Polls" component={PollsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export default OwnerNavigator;
