import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Help'>;
};

export default function HelpScreen({ navigation }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isLight = colorScheme === 'light';
  const styles = getStyles(isLight);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(30)).current;

  // Re-define data to use translations dynamically
  const HELP_DATA = [
    {
      id: '1',
      title: t("helpQ1"),
      icon: 'touch-app',
      content: t("helpA1"),
    },
    {
      id: '2',
      title: t("helpQ2"),
      icon: 'local-hospital',
      content: t("helpA2"),
    },
    {
      id: '3',
      title: t("helpQ3"),
      icon: 'person',
      content: t("helpA3"),
    },
    {
      id: '4',
      title: t("helpQ4"),
      icon: 'contact-phone',
      content: t("helpA4"),
    },
  ];

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
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} backgroundColor={isLight ? "#f3f4f6" : "#000000"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={isLight ? "#eab308" : "#facc15"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("helpInstructions")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.banner}>
            <MaterialIcons name="support-agent" size={48} color="#ef4444" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{t("emergencyGuide")}</Text>
              <Text style={styles.bannerBody}>
                {t("emergencyGuideDesc")}
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
                  <View style={[styles.accordionIcon, isExpanded ? styles.accordionIconActive : undefined]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={isExpanded ? '#000000' : (isLight ? '#eab308' : '#facc15')}
                    />
                  </View>
                  <Text style={[styles.accordionTitle, isExpanded ? styles.accordionTitleActive : undefined]}>
                    {item.title}
                  </Text>
                  <MaterialIcons
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={28}
                    color={isExpanded ? (isLight ? '#eab308' : '#facc15') : '#6b7280'}
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

const getStyles = (isLight: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isLight ? '#f3f4f6' : '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isLight ? '#ffffff' : '#000000',
    borderBottomWidth: 1,
    borderBottomColor: isLight ? '#e5e7eb' : '#111827',
  },
  backBtn: { padding: 8 },
  headerTitle: { color: isLight ? '#111827' : '#ffffff', fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  banner: {
    backgroundColor: 'rgba(127,29,29,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(153,27,27,0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: { marginLeft: 16, flex: 1 },
  bannerTitle: { color: '#ef4444', fontWeight: '900', fontSize: 17, marginBottom: 4 },
  bannerBody: { color: isLight ? '#4b5563' : '#d1d5db', fontSize: 12, lineHeight: 20 },
  accordionCard: {
    backgroundColor: isLight ? '#ffffff' : '#111827',
    borderWidth: 1,
    borderColor: isLight ? '#e5e7eb' : '#1f2937',
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
    backgroundColor: isLight ? '#f9fafb' : '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: isLight ? '#e5e7eb' : 'transparent',
  },
  accordionIconActive: { backgroundColor: isLight ? '#facc15' : '#facc15' },
  accordionTitle: { flex: 1, color: isLight ? '#111827' : '#ffffff', fontWeight: '700', fontSize: 15 },
  accordionTitleActive: { color: isLight ? '#ca8a04' : '#facc15' },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  accordionBodyInner: {
    backgroundColor: isLight ? '#f9fafb' : 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: isLight ? '#e5e7eb' : 'rgba(31,41,55,0.5)',
  },
  accordionContent: { color: isLight ? '#4b5563' : '#d1d5db', fontSize: 14, lineHeight: 24 },
});
