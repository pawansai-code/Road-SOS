// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SuccessScreen from '../screens/SuccessScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  About: undefined;
  Help: undefined;
  Profile: undefined;
  Success: undefined;
  History: undefined;
  LiveTracking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
