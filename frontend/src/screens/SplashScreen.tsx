import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        <Text className="text-primary text-6xl font-bold tracking-widest mb-2">Aran</Text>
        <View className="h-1 w-24 bg-primary rounded-full mb-4 opacity-80" />
        <Text className="text-textSecondary text-sm tracking-[0.2em] uppercase font-medium">
          Premium Mobile App
        </Text>
      </Animated.View>
    </View>
  );
}
