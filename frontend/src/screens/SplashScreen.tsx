// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, Animated, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  // Animated values for premium staggered entry
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const logoScale = React.useRef(new Animated.Value(0.85)).current;
  const dividerScale = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const textTranslateY = React.useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // Staggered micro-animations sequence
    Animated.sequence([
      // 1. Fade & Spring Scale the Logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Expand Divider horizontally
      Animated.timing(dividerScale, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // 3. Slide up and Fade the descriptive subtitle
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Smooth navigation redirect to Home
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Brand Logo & Title */}
      <Animated.View 
        style={{ 
          opacity: logoOpacity,
          transform: [{ scale: logoScale }]
        }} 
        className="items-center"
      >
        <Text className="text-white text-5xl font-black tracking-widest mb-1">
          Aran
        </Text>
      </Animated.View>

      {/* Elegant Horizontal Divider */}
      <Animated.View 
        style={{ 
          transform: [{ scaleX: dividerScale }],
          opacity: dividerScale
        }} 
        className="h-[2px] w-36 bg-yellow-400 my-4"
      />

      {/* Subtitle / Tagline */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }]
        }}
        className="items-center"
      >
        <Text className="text-gray-400 text-xs tracking-[0.3em] uppercase font-bold">
          Emergency Assistance
        </Text>
      </Animated.View>
    </View>
  );
}

