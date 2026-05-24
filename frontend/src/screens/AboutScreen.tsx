import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'About'>;
};

export default function AboutScreen({ navigation }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 20, friction: 5, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardsTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#facc15" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Animated Logo */}
        <Animated.View
          style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoCircle}>
            <MaterialIcons name="security" size={56} color="#facc15" />
          </View>
        </Animated.View>

        {/* Version Info */}
        <Animated.View
          style={[styles.textSection, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}
        >
          <Text style={styles.appName}>
            ROAD <Text style={styles.appNameYellow}>SOS</Text>
          </Text>
          <Text style={styles.versionText}>Version 6.1.0</Text>
          <Text style={styles.description}>
            An all-in-one emergency application designed to connect you with critical services instantly, exactly when you need them.
          </Text>
        </Animated.View>

        {/* Info Cards */}
        <Animated.View style={{ opacity: cardsOpacity, transform: [{ translateY: cardsTranslateY }] }}>

          <View style={styles.card}>
            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} activeOpacity={0.7}>
              <View style={styles.cardRowLeft}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="description" size={20} color="#facc15" />
                </View>
                <Text style={styles.cardRowText}>Terms of Service</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} activeOpacity={0.7}>
              <View style={styles.cardRowLeft}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="privacy-tip" size={20} color="#facc15" />
                </View>
                <Text style={styles.cardRowText}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardRow} activeOpacity={0.7}>
              <View style={styles.cardRowLeft}>
                <View style={styles.iconBadge}>
                  <MaterialIcons name="library-books" size={20} color="#facc15" />
                </View>
                <Text style={styles.cardRowText}>Open Source Licenses</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Support Card */}
          <View style={styles.supportCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Need support?</Text>
              <Text style={styles.supportSubtitle}>Contact the developer directly</Text>
            </View>
            <TouchableOpacity
              style={styles.emailBtn}
              onPress={() => Linking.openURL('mailto:support@roadsos.com')}
            >
              <Text style={styles.emailBtnText}>Email Us</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  backBtn: { padding: 8 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#111827',
    borderWidth: 4,
    borderColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: { alignItems: 'center', marginBottom: 32 },
  appName: { color: '#ffffff', fontSize: 30, fontWeight: '900', marginBottom: 4 },
  appNameYellow: { color: '#facc15' },
  versionText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  description: {
    color: '#d1d5db',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  cardRowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(250,204,21,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardRowText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  supportCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  supportTitle: { color: '#ffffff', fontWeight: '700', fontSize: 15, marginBottom: 2 },
  supportSubtitle: { color: '#9ca3af', fontSize: 12 },
  emailBtn: {
    backgroundColor: '#facc15',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  emailBtnText: { color: '#000000', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
});
