import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Success'>;
};

export default function SuccessScreen({ navigation }: Props) {
  const [timeLeft, setTimeLeft] = useState(30);

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigation.goBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation, scaleValue, opacityValue]);

  const handleDismiss = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View
        style={[
          styles.content,
          { opacity: opacityValue, transform: [{ scale: scaleValue }] },
        ]}
      >
        {/* Checkmark Icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <MaterialIcons name="check" size={64} color="#000000" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Alert Sent!</Text>

        {/* Body */}
        <Text style={styles.body}>
          Your SOS alert was successfully triggered. Authorities and your
          emergency contacts have received your live location and medical
          details.
        </Text>

        {/* Timer card */}
        <View style={styles.timerCard}>
          <MaterialIcons name="timer" size={24} color="#facc15" />
          <Text style={styles.timerText}>
            This screen will close in{' '}
            <Text style={styles.timerHighlight}>{timeLeft}s</Text>
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss} activeOpacity={0.75}>
          <Text style={styles.dismissText}>Dismiss Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  iconOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  body: {
    color: '#d1d5db',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  timerCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  timerText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  timerHighlight: {
    color: '#facc15',
    fontWeight: '900',
  },
  dismissBtn: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dismissText: {
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 13,
  },
});
