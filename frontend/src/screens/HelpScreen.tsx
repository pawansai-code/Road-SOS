import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Help'>;
};

const HELP_DATA = [
  {
    id: '1',
    title: 'How to trigger SOS?',
    icon: 'touch-app',
    content:
      '1. Open the application.\n2. Tap the large pulsating SOS button on the home screen.\n3. Wait 5 seconds for the countdown, or tap again to cancel.\n4. Your emergency contacts and local authorities will be notified with your live GPS location.',
  },
  {
    id: '2',
    title: 'What happens after an SOS is sent?',
    icon: 'local-hospital',
    content:
      'Once the SOS is triggered, the app immediately dispatches your profile information (blood group, medical notes) and real-time location to the nearest control room. Volunteers in your vicinity may also receive an alert.',
  },
  {
    id: '3',
    title: 'How to update my medical profile?',
    icon: 'person',
    content:
      'Navigate to the Profile screen from the sidebar or quick actions menu. You can update your full name, blood group, phone number, and critical medical notes there. Make sure to hit "Save" so responders have accurate data.',
  },
  {
    id: '4',
    title: 'Can I add multiple emergency contacts?',
    icon: 'contact-phone',
    content:
      'Yes! Go to the "E-Contact" section in the sidebar. You can add up to 5 emergency contacts. These contacts will receive an SMS with your location link when an emergency is triggered.',
  },
];

export default function HelpScreen({ navigation }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(listTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#facc15" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Instructions</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.banner}>
            <MaterialIcons name="support-agent" size={48} color="#ef4444" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Emergency Guide</Text>
              <Text style={styles.bannerBody}>
                Learn how to effectively use ROAD SOS in critical situations to ensure rapid response.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Accordion List */}
        <Animated.View style={{ opacity: listOpacity, transform: [{ translateY: listTranslateY }] }}>
          {HELP_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.accordionCard}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={[styles.accordionIcon, isExpanded && styles.accordionIconActive]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={isExpanded ? '#000000' : '#facc15'}
                    />
                  </View>
                  <Text style={[styles.accordionTitle, isExpanded && styles.accordionTitleActive]}>
                    {item.title}
                  </Text>
                  <MaterialIcons
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={28}
                    color={isExpanded ? '#facc15' : '#6b7280'}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    <View style={styles.accordionBodyInner}>
                      <Text style={styles.accordionContent}>{item.content}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  banner: {
    backgroundColor: 'rgba(127,29,29,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(153,27,27,0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: { marginLeft: 16, flex: 1 },
  bannerTitle: { color: '#f87171', fontWeight: '900', fontSize: 17, marginBottom: 4 },
  bannerBody: { color: '#d1d5db', fontSize: 12, lineHeight: 20 },
  accordionCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accordionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accordionIconActive: { backgroundColor: '#facc15' },
  accordionTitle: { flex: 1, color: '#ffffff', fontWeight: '700', fontSize: 15 },
  accordionTitleActive: { color: '#facc15' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  accordionBodyInner: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.5)',
  },
  accordionContent: { color: '#d1d5db', fontSize: 14, lineHeight: 24 },
});
