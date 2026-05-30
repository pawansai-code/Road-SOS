// @ts-nocheck
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
  StatusBar,
  Image,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  triggerSOS,
  cancelSOS,
  logSOSEventToBackend,
} from "../store/slices/sosSlice";
import { BASE_URL } from "../config";
import { fetchContacts, fetchSmsTemplate } from "../store/slices/contactsSlice";
import { logout } from "../store/slices/authSlice";
import { setHasSeenTutorial } from "../store/slices/userSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import { CopilotStep, walkthroughable, useCopilot } from "react-native-copilot";
import { checkNetworkStatus } from "../features/offline/services/networkService";
import { saveOfflineSOS } from "../features/offline/services/offlineStorageService";
import { useNetworkStatus } from "../features/offline/hooks/useNetworkStatus";

const CopilotView = walkthroughable(View);
const CopilotTouchableOpacity = walkthroughable(TouchableOpacity);

const QuickAction = React.memo(
  React.forwardRef(
    ({ icon, label, isSOS = false, onPress, copilot }: any, ref: any) => {
      const { colorScheme } = useColorScheme();
      return (
        <TouchableOpacity
          ref={ref}
          className="w-[23%] min-h-[80px] items-center mb-6"
          onPress={onPress}
          {...copilot}
        >
          <View
            className={`w-14 h-14 rounded-full items-center justify-center mb-2 shadow-sm ${
              isSOS
                ? "bg-red-600"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            }`}
          >
            {isSOS ? (
              <Text className="text-gray-900 dark:text-white font-black text-sm">
                SOS
              </Text>
            ) : (
              <MaterialIcons
                name={icon}
                size={28}
                color={colorScheme === "dark" ? "#facc15" : "#eab308"}
              />
            )}
          </View>
          <Text
            className="text-gray-700 dark:text-gray-300 text-[11px] text-center font-bold mt-1"
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
  ),
);
const CopilotQuickAction = walkthroughable(QuickAction);

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [showLangModal, setShowLangModal] = React.useState(false);
  const languages = [
    { code: "en", label: "English" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "hi", label: "हिंदी" },
    { code: "ml", label: "മലയാളം" },
    { code: "kn", label: "ಕನ್ನಡ" },
  ];
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLangModal(false);
  };

  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isEmergencyActive, lastUpdated } = useAppSelector(
    (state) => state.sos,
  );
  const { profile, hasSeenTutorial } = useAppSelector((state) => state.user);
  const { contacts, smsTemplate } = useAppSelector((state) => state.contacts);
  const initial = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : "?";

  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [selectedService, setSelectedService] = React.useState("POLICE");
  const [currentLocation, setCurrentLocation] = React.useState(
    t("fetchingLocation"),
  );
  // Tracks current internet connectivity status
  const isOnline = useNetworkStatus();

  const { start, copilotEvents } = useCopilot();

  React.useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        start();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  React.useEffect(() => {
    const handleCopilotStop = () => {
      dispatch(setHasSeenTutorial(true));
    };

    copilotEvents.on("stop", handleCopilotStop);
    return () => {
      copilotEvents.off("stop", handleCopilotStop);
    };
  }, [copilotEvents, dispatch]);

  React.useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchSmsTemplate());

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        return;
      }
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        // Reverse geocode to get human-readable address
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geocode && geocode.length > 0) {
            const addr = geocode[0];
            // Combine street and city, filtering out nulls
            const parts = [
              addr.name || addr.street,
              addr.city || addr.subregion,
              addr.region,
            ].filter(Boolean);
            setCurrentLocation(parts.join(", ") || t("locationAcquired"));
          } else {
            setCurrentLocation(t("locationAcquired"));
          }
        } catch (geoErr) {
          setCurrentLocation(t("locationAcquired"));
        }
      } catch (e) {
        setLocationError(t("locationDenied"));
      }
    })();
  }, [dispatch]);

  const handleContactPress = (contact: any) => {
    Alert.alert(
      `Contact ${contact.contact_name}`,
      `Choose an action for your ${contact.relationship}`,
      [
        {
          text: "Call",
          onPress: () => {
            dispatch(triggerSOS(contact.contact_name));
            dispatch(logSOSEventToBackend(contact.contact_name));
            Linking.openURL(`tel:${contact.phone_number}`).catch((err) =>
              console.log("Error opening dialer:", err),
            );
          },
        },
        {
          text: "Send SMS",
          onPress: async () => {
            dispatch(triggerSOS(contact.contact_name));
            dispatch(logSOSEventToBackend(contact.contact_name));

            let activeLoc = location;
            if (!activeLoc?.coords) {
              try {
                let { status } =
                  await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                  activeLoc = await Location.getLastKnownPositionAsync();
                  if (!activeLoc?.coords) {
                    activeLoc = await Location.getCurrentPositionAsync({
                      accuracy: Location.Accuracy.Balanced,
                    });
                  }
                  setLocation(activeLoc);
                }
              } catch (err) {
                console.log("Contact SMS location fetch failed", err);
              }
            }

            let message =
              smsTemplate || "🚨 EMERGENCY SOS 🚨 I need immediate assistance!";
            if (activeLoc?.coords) {
              message += `\n\nLive Location: https://maps.google.com/?q=${activeLoc.coords.latitude},${activeLoc.coords.longitude}`;
            } else {
              message += `\n\nLive Location: Unknown (Fetching failed or denied)`;
            }
            const separator = Platform.OS === "ios" ? "&" : "?";
            const url = `sms:${
              contact.phone_number
            }${separator}body=${encodeURIComponent(message)}`;
            Linking.openURL(url).catch((err) =>
              console.log("Error opening SMS app:", err),
            );
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  // States for countdown
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Animated scale for high-end SOS pulsing effect
  const pulseScale = React.useRef(new Animated.Value(1)).current;

  // States and refs for animated drawer sidebar
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const sidebarTranslateX = React.useRef(new Animated.Value(-280)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  const toggleSidebar = (open: boolean) => {
    if (open) {
      setIsSidebarVisible(true);
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: -280,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsSidebarVisible(false);
      });
    }
  };

  React.useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isEmergencyActive || countdown !== null) {
      // Pulse slightly faster during countdown to convey visual urgency
      const pulseDuration = countdown !== null ? 500 : 800;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.08,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulseScale.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isEmergencyActive, countdown]);

  // Clean up interval timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // BASE_URL imported from config.ts
  const sendSOSRequest = async (
    overrideLoc?: Location.LocationObject | null,
  ) => {
    try {
      const activeLoc = overrideLoc || location;
      // Prepare data, fallback to 0.0 if location is missing so emergency request still goes through
      const sosData = {
        latitude: activeLoc?.coords?.latitude || 0.0,
        longitude: activeLoc?.coords?.longitude || 0.0,
        service_type: selectedService,
      };
      console.log("SENDING TO BACKEND:", sosData);
      // Send to backend
      const response = await axios.post(
        `${BASE_URL}/api/sos/trigger/`,
        sosData,
      );
      console.log("BACKEND RESPONSE:", response.data);
      // Map link returned from backend: response.data.map_link
      return true;
    } catch (error) {
      console.log("SOS BACKEND ERROR:", error);
      Alert.alert("Backend Error", "Failed to send SOS");
      return false;
    }
  };

  const handleSOSPress = () => {
    if (isEmergencyActive) {
      // 1. If already in active emergency, cancel immediately
      dispatch(cancelSOS());
    } else if (countdown !== null) {
      // 2. If countdown is ticking, tapping cancels the countdown
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(null);
    } else {
      // 3. Otherwise, trigger a 5-second countdown first
      setCountdown(5);
      let count = 5;
      timerRef.current = setInterval(async () => {
        count -= 1;
        if (count <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCountdown(null);

          // Actively fetch fresh location if it's missing
          let activeLoc = location;
          if (!activeLoc?.coords) {
            try {
              // Request permissions again just in case it was denied previously
              let { status } =
                await Location.requestForegroundPermissionsAsync();
              if (status === "granted") {
                // Try to get last known position first (much faster, less likely to hang)
                activeLoc = await Location.getLastKnownPositionAsync();

                // If no last known position, force a fresh fetch
                if (!activeLoc?.coords) {
                  activeLoc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                  });
                }
                setLocation(activeLoc);
                setLocationError(null);
              } else {
                console.log("Location permission denied during SOS trigger");
              }
            } catch (err) {
              console.log("Failed to fetch fresh location", err);
            }
          }
          // Check current internet connectivity status
          const isOnline = await checkNetworkStatus();
          // If internet is unavailable, activate offline SOS flow
          if (!isOnline) {
            const isAvailable = await SMS.isAvailableAsync();

            if (isAvailable) {
               // Prepare emergency contact numbers including national helpline
              const numbers = [
                "112",
                ...contacts.map((c: any) => c.phone_number),
              ];

              // Default offline emergency message
              let message =
                "🚨 OFFLINE EMERGENCY SOS 🚨\nI need immediate assistance!";

               // Attach Google Maps live location if coordinates exist
              if (activeLoc?.coords) {
                message += `\n\nLive Location: https://maps.google.com/?q=${activeLoc.coords.latitude},${activeLoc.coords.longitude}`;
              } else {
                message += `\n\nLocation unavailable`;
              }
              // Open SMS composer and send emergency alert
              await SMS.sendSMSAsync(numbers, message);
            }

            // Store offline SOS incident locally for future sync
            await saveOfflineSOS({
              latitude: activeLoc?.coords?.latitude,
              longitude: activeLoc?.coords?.longitude,
              service_type: selectedService,
            });

            // Navigate user to success confirmation screen
            navigation.navigate("Success");

            return;
          }

          //send data to backend and trigger SOS
          const success = await sendSOSRequest(activeLoc);

          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            const numbers = [
              "112",
              ...contacts.map((c: any) => c.phone_number),
            ];
            let message =
              smsTemplate || "🚨 EMERGENCY SOS 🚨 I need immediate assistance!";
            if (activeLoc?.coords) {
              message += `\n\nLive Location: https://maps.google.com/?q=${activeLoc.coords.latitude},${activeLoc.coords.longitude}`;
            } else {
              message += `\n\nLive Location: Unknown (Fetching failed or denied)`;
            }
            // Open SMS composer without awaiting so we can immediately navigate to success screen
            SMS.sendSMSAsync(numbers, message).catch(console.error);
          }

          if (success) {
            dispatch(triggerSOS());
            navigation.navigate("Success");
          }
        } else {
          setCountdown(count);
        }
      }, 1000);
    }
  };

  const handleEmergencyCall = (serviceName: string, phoneNumber: string) => {
    // Log to local history state
    dispatch(triggerSOS(serviceName));
    // Sync to backend DB
    dispatch(logSOSEventToBackend(serviceName));

    // Route to actual nearest service or dummy number for MVP
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      console.log("Error opening dialer:", err),
    );
  };
  //selected service component with dynamic styling based on selection
  const EmergencyService = ({
    icon,
    label,
    phoneNumber,
  }: {
    icon: any;
    label: string;
    phoneNumber: string;
  }) => {
    return (
      <TouchableOpacity
        className="w-[23%] min-h-[90px] rounded-2xl items-center justify-center p-2 mb-4 shadow-sm border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
        onPress={() => {
          setSelectedService(label);
          console.log("SELECTED SERVICE:", label);
          handleEmergencyCall(label, phoneNumber);
        }}
      >
        <MaterialIcons
          name={icon}
          size={28}
          color={colorScheme === "dark" ? "#facc15" : "#eab308"}
        />

        <Text
          className="font-bold text-[10px] mt-2 text-center text-gray-900 dark:text-white"
          numberOfLines={2}
          adjustsFontSizeToFit={true}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Dynamic values based on active state / countdown ticking state
  let buttonBg = "bg-red-600 shadow-red-600/50";
  let buttonRingOuter = "bg-red-950/20 border border-red-600/10";
  let buttonRingMiddle = "bg-red-900/30";
  let buttonText = t("sosButton");
  let buttonSubtext = t("tapInEmergency");

  if (isEmergencyActive) {
    buttonBg = "bg-red-800 shadow-red-500/60 border border-red-400";
    buttonRingOuter = "bg-red-950/45 border border-red-500/25";
    buttonRingMiddle = "bg-red-950/70 border border-red-600/20";
    buttonText = t("stopButton");
    buttonSubtext = t("tapToCancel");
  } else if (countdown !== null) {
    buttonBg = "bg-amber-600 shadow-amber-500/60 border border-amber-400";
    buttonRingOuter = "bg-amber-950/40 border border-amber-500/25";
    buttonRingMiddle = "bg-amber-950/60 border border-amber-600/20";
    buttonText = `${countdown}`;
    buttonSubtext = t("tapToCancel");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-black">
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "#000000" : "#ffffff"}
      />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-black">
        <CopilotStep text={t("menu")} order={5} name="menu">
          <CopilotTouchableOpacity onPress={() => toggleSidebar(true)}>
            <MaterialIcons
              name="menu"
              size={28}
              color={colorScheme === "dark" ? "#facc15" : "#eab308"}
            />
          </CopilotTouchableOpacity>
        </CopilotStep>
        <Text className="text-gray-900 dark:text-white text-xl font-bold tracking-wider">
          {t("allInOneNumber").substring(0, 0)}ROAD{" "}
          <Text className="text-yellow-500 dark:text-yellow-400">SOS</Text>
        </Text>
        <View className="flex-row items-center space-x-4 ml-4">
          <TouchableOpacity onPress={() => setShowLangModal(true)}>
            <MaterialIcons
              name="translate"
              size={26}
              color={colorScheme === "dark" ? "#facc15" : "#4b5563"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleColorScheme} className="ml-4">
            <MaterialIcons
              name={colorScheme === "dark" ? "light-mode" : "dark-mode"}
              size={26}
              color={colorScheme === "dark" ? "#facc15" : "#4b5563"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => start()} className="ml-4">
            <MaterialIcons
              name="info-outline"
              size={26}
              color={colorScheme === "dark" ? "#facc15" : "#4b5563"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {!isOnline && (
          <View
            style={{
              backgroundColor: "#ff4444",
              padding: 10,
              borderRadius: 12,
              marginTop: 12,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              ⚠️ OFFLINE MODE ACTIVE
            </Text>
          </View>
        )}
        {/* Main Banner (Now positioned directly at the top) */}
        <CopilotStep
          text="Your all-in-one emergency hub. Access volunteers, live tracking, and more."
          order={2}
          name="banner"
        >
          <CopilotView
            style={{ flexDirection: "row", marginTop: 16, marginBottom: 24 }}
          >
            <View className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 mr-3 overflow-hidden justify-center relative">
              <View className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-10 -mt-10" />
              <Text className="text-gray-900 dark:text-white text-sm font-medium leading-5 mb-1 z-10">
                {t("allInOneNumber")}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs leading-4 z-10 w-2/3">
                {t("emergencyServicesInOnePlace")}
              </Text>
              <View className="absolute right-4 top-1/2 -translate-y-1/2 z-0">
                <Text
                  className="text-5xl font-black text-yellow-400 tracking-tighter"
                  style={{
                    textShadowColor: "rgba(250, 204, 21, 0.3)",
                    textShadowOffset: { width: 0, height: 4 },
                    textShadowRadius: 8,
                  }}
                >
                  112
                </Text>
              </View>
            </View>

            <View className="w-1/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 justify-center">
              <Text className="text-gray-900 dark:text-white font-bold mb-2">
                {t("dial112")}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-[10px] leading-4 border-l-2 border-yellow-400 pl-2">
                {t("oneAppForAll")}
              </Text>
            </View>
          </CopilotView>
        </CopilotStep>

        {/* Massive Pulsing Centered SOS Button (Now repositioned below the 112 Banner) */}
        <View className="items-center justify-center my-6">
          <CopilotStep
            text="Tap this massive button in emergencies to instantly send your location and alert your contacts/services."
            order={1}
            name="sos"
          >
            <CopilotTouchableOpacity
              onPress={handleSOSPress}
              activeOpacity={0.85}
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              {/* Outer soft glowing ring with animated pulse */}
              <Animated.View
                style={{ transform: [{ scale: pulseScale }] }}
                className={`w-52 h-52 rounded-full items-center justify-center ${buttonRingOuter}`}
              >
                {/* Middle structural ring */}
                <View
                  className={`w-44 h-44 rounded-full items-center justify-center ${buttonRingMiddle}`}
                >
                  {/* Core tactile emergency button */}
                  <View
                    className={`w-36 h-36 rounded-full items-center justify-center shadow-2xl ${buttonBg}`}
                  >
                    <Text
                      className="text-gray-900 dark:text-white font-black text-4xl tracking-widest text-center px-2 w-full"
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {buttonText}
                    </Text>
                    <Text
                      className="text-red-200 text-[9px] font-black tracking-widest mt-2 uppercase text-center px-2 w-full"
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {buttonSubtext}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </CopilotTouchableOpacity>
          </CopilotStep>
        </View>

        {/* Quick Actions Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <CopilotStep
            text="Manage your emergency contacts and medical info in your Profile."
            order={6}
            name="profile"
          >
            <CopilotQuickAction
              icon="person-outline"
              label={t("profile")}
              onPress={() => navigation.navigate("Profile")}
            />
          </CopilotStep>
          <QuickAction 
            icon="phone-in-talk" 
            label={t("dial112")} 
            onPress={() => Linking.openURL('tel:112')}
          />
          <QuickAction icon="chat-bubble-outline" label={t("chatUs")} />
          <CopilotStep
            text="Quickly access live location tracking."
            order={4}
            name="trackMe"
          >
            <CopilotQuickAction
              icon="my-location"
              label={t("trackMe")}
              onPress={() => navigation.navigate("LiveTracking")}
            />
          </CopilotStep>
        </View>

        {/* Contact Emergency Services */}
        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">
          Emergency Services
        </Text>
        <CopilotStep
          text="Directly contact Police, Fire, Medical, and other specific services with one tap."
          order={3}
          name="services"
        >
          <CopilotView
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <EmergencyService
              icon="local-police"
              label={t("police")}
              phoneNumber="100"
            />
            <EmergencyService
              icon="local-fire-department"
              label={t("fire")}
              phoneNumber="101"
            />
            <EmergencyService
              icon="local-hospital"
              label={t("medical")}
              phoneNumber="108"
            />
            <EmergencyService
              icon="storm"
              label={t("disaster")}
              phoneNumber="1078"
            />

            <EmergencyService
              icon="woman"
              label={t("woman")}
              phoneNumber="1091"
            />
            <EmergencyService
              icon="child-care"
              label={t("child")}
              phoneNumber="1098"
            />
            <EmergencyService
              icon="elderly"
              label={t("elderly")}
              phoneNumber="14567"
            />
            <EmergencyService
              icon="traffic"
              label={t("traffic")}
              phoneNumber="103"
            />
          </CopilotView>
        </CopilotStep>

        {/* Emergency Contacts */}
        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">
          Emergency Contacts
        </Text>
        <View className="flex-row flex-wrap justify-between mb-4">
          {contacts.map((contact) => (
            <QuickAction
              key={contact.id}
              icon="person"
              label={contact.contact_name}
              onPress={() => handleContactPress(contact)}
            />
          ))}
          {contacts.length === 0 && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
              {t("noContactsSaved")}
            </Text>
          )}
          {contacts.length > 0 &&
            Array.from({
              length: 4 - (contacts.length % 4 === 0 ? 4 : contacts.length % 4),
            }).map((_, i) => (
              <View key={`placeholder-${i}`} style={{ width: "23%" }} />
            ))}
        </View>



        {/* Location Banner */}
        <View
          className={`flex-row items-center border rounded-2xl p-4 mb-4 ${
            locationError
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
              : currentLocation === t("fetchingLocation")
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
              : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50"
          }`}
        >
          <MaterialIcons
            name="location-on"
            size={24}
            color={
              locationError
                ? "#ef4444"
                : currentLocation === t("fetchingLocation")
                ? "#f59e0b"
                : "#10b981"
            }
          />
          <Text
            className={`font-bold ml-2 flex-1 ${
              locationError
                ? "text-red-700 dark:text-red-400"
                : currentLocation === t("fetchingLocation")
                ? "text-amber-700 dark:text-amber-400"
                : "text-green-700 dark:text-green-400"
            }`}
          >
            {locationError ? t("locationDenied") : currentLocation}
          </Text>
        </View>

        {/* Permission Notice */}
        {locationError && (
          <View className="flex-row items-center justify-between bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-4">
            <Text className="text-gray-500 dark:text-gray-400 text-xs flex-1 mr-4 leading-5">
              {t("locationPermissionRequired")}
            </Text>
            <TouchableOpacity
              className="bg-white rounded-full px-4 py-2"
              onPress={() => Linking.openSettings()}
            >
              <Text className="text-white dark:text-black text-xs font-bold">
                {t("settings")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sidebar Overlay */}
      {isSidebarVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 z-50 flex-row">
          {/* Translucent Backdrop */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => toggleSidebar(false)}
            style={{ width: "100%", height: "100%", position: "absolute" }}
          >
            <Animated.View
              style={{ opacity: backdropOpacity }}
              className="w-full h-full bg-gray-100 dark:bg-black"
            />
          </TouchableOpacity>

          {/* Sidebar Panel Drawer */}
          <Animated.View
            style={{
              transform: [{ translateX: sidebarTranslateX }],
              width: 280,
              height: "100%",
              backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff", // background to ensure zero transparency
            }}
            className="border-r border-gray-300 dark:border-gray-900 pt-12 pb-6 flex-col justify-between"
          >
            <View>
              {/* Profile Header Block */}
              <View className="flex-row items-center px-6 mb-8 mt-6">
                <View className="w-14 h-14 rounded-full bg-yellow-400 items-center justify-center shadow-lg shadow-yellow-400/20 mr-4 overflow-hidden">
                  {profile?.profile_image ? (
                    <Image
                      source={{ uri: profile.profile_image }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Text className="text-white dark:text-black text-2xl font-black">
                      {initial}
                    </Text>
                  )}
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-extrabold text-base tracking-wide">
                    {profile?.full_name || t("guestUser")}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 font-semibold text-xs mt-1">
                    {profile?.phone_number || t("noPhoneAdded")}
                  </Text>
                </View>
              </View>

              {/* Navigation Options list */}
              <View className="px-3">
                {/* Home (Selected Option) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-row items-center py-3.5 px-4 bg-yellow-400/10 border-l-4 border-yellow-400 rounded-r-2xl mb-1.5"
                >
                  <MaterialIcons
                    name="home"
                    size={24}
                    color={colorScheme === "dark" ? "#facc15" : "#eab308"}
                  />
                  <Text className="text-yellow-400 font-extrabold text-sm ml-4">
                    Home
                  </Text>
                </TouchableOpacity>

                {/* Profile */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-white dark:bg-gray-900"
                  onPress={() => {
                    toggleSidebar(false);
                    navigation.navigate("Profile");
                  }}
                >
                  <MaterialIcons name="person" size={24} color="#9ca3af" />
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-sm ml-4">
                    Profile
                  </Text>
                </TouchableOpacity>

                {/* E-Contact */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-white dark:bg-gray-900"
                  onPress={() => {
                    toggleSidebar(false);
                    navigation.navigate("Profile");
                  }}
                >
                  <MaterialIcons
                    name="contact-phone"
                    size={24}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-sm ml-4">
                    E-Contact
                  </Text>
                </TouchableOpacity>

                {/* SOS History */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-white dark:bg-gray-900"
                  onPress={() => {
                    toggleSidebar(false);
                    navigation.navigate("History");
                  }}
                >
                  <MaterialIcons name="history" size={24} color="#9ca3af" />
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-sm ml-4">
                    SOS History
                  </Text>
                </TouchableOpacity>

                {/* Settings Removed */}

                {/* App Info */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-white dark:bg-gray-900"
                  onPress={() => {
                    toggleSidebar(false);
                    navigation.navigate("About");
                  }}
                >
                  <MaterialIcons
                    name="info-outline"
                    size={24}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-sm ml-4">
                    App Info
                  </Text>
                </TouchableOpacity>

                {/* Top Questions */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-white dark:bg-gray-900"
                  onPress={() => {
                    toggleSidebar(false);
                    navigation.navigate("Help");
                  }}
                >
                  <MaterialIcons
                    name="help-outline"
                    size={24}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-600 dark:text-gray-300 font-bold text-sm ml-4">
                    Top Questions
                  </Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center py-3.5 px-4 rounded-2xl mb-1.5 active:bg-red-950/20 mt-4"
                  onPress={() => dispatch(logout())}
                >
                  <MaterialIcons name="logout" size={24} color="#f87171" />
                  <Text className="text-red-400 font-extrabold text-sm ml-4">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Version Footer */}
            <View className="px-6">
              <Text className="text-gray-600 font-bold text-xs">
                Version 6.1.0
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="fade">
        <View className="flex-1 bg-gray-100/60 dark:bg-black/60 justify-center items-center px-4">
          <View className="bg-white dark:bg-gray-900 w-full rounded-3xl p-6 border border-gray-200 dark:border-gray-800">
            <Text className="text-gray-900 dark:text-white text-xl font-bold mb-4">
              Select Language
            </Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                className="py-3 border-b border-gray-200 dark:border-gray-800"
              >
                <Text className="text-gray-800 dark:text-gray-300 text-base">
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowLangModal(false)}
              className="mt-4 py-3 bg-red-600 rounded-xl items-center"
            >
              <Text className="text-white dark:text-white font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
