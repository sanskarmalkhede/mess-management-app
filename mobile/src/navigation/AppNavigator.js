import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

// Navigators
import GuestNavigator from './GuestNavigator';
import OwnerNavigator from './OwnerNavigator';
import MemberNavigator from './MemberNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in - show Login first, Guest accessible via button
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Guest" component={GuestNavigator} />
          </>
        ) : (
          // Logged in - role based navigation
          <>
            {userRole === 'owner' && (
              <Stack.Screen name="Owner" component={OwnerNavigator} />
            )}
            {userRole === 'member' && (
              <Stack.Screen name="Member" component={MemberNavigator} />
            )}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
