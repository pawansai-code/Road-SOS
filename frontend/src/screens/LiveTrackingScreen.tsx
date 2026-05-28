import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005; // Zoomed in close
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function LiveTrackingScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(t("locationDenied"));
        return;
      }

      try {
        let initialLocation = await Location.getLastKnownPositionAsync();
        if (!initialLocation) {
           initialLocation = await Location.getCurrentPositionAsync({});
        }
        setLocation(initialLocation);
        
        if (mapRef.current && initialLocation) {
          mapRef.current.animateToRegion({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }, 1000);
        }
      } catch (err) {
        console.log("Error getting initial location", err);
      }

      try {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, 
            distanceInterval: 5, 
          },
          (newLocation) => {
            setLocation(newLocation);
            
            if (isTracking && mapRef.current) {
              mapRef.current.animateCamera({
                center: {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                },
                pitch: 45,
                heading: newLocation.coords.heading || 0, 
              });
            }
          }
        );
      } catch (err) {
         setErrorMsg(t("fetchingLocation"));
      }
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking]);

  const recenterMap = () => {
    setIsTracking(true);
    if (location && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 17,
        pitch: 45,
        heading: location.coords.heading || 0,
      }, { duration: 1000 });
    }
  };

  const isLight = colorScheme === 'light';

  return (
    <SafeAreaView style={[styles.container, isLight && { backgroundColor: '#f3f4f6' }]} edges={['top']}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, isLight && { backgroundColor: 'rgba(255,255,255,0.8)' }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={isLight ? "#000" : "#fff"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isLight && { backgroundColor: 'rgba(255,255,255,0.8)', color: '#000' }]}>{t("liveTracking")}</Text>
        <View style={{width: 40}} /> 
      </View>

      {errorMsg ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : !location ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#facc15" />
          <Text style={[styles.loadingText, isLight && { color: '#000' }]}>{t("acquiringGPS")}</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            showsUserLocation={false} 
            showsMyLocationButton={false}
            showsCompass={false}
            mapType="standard"
            onPanDrag={() => setIsTracking(false)} 
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title={t("you")}
              description={t("liveLocation")}
            >
              {/* Custom Marker UI */}
              <View style={styles.markerContainer}>
                <View style={styles.markerRing}>
                  <View style={styles.markerCore} />
                </View>
              </View>
            </Marker>
          </MapView>

          {/* Recenter Button Overlay */}
          {!isTracking && (
            <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
              <MaterialIcons name="my-location" size={24} color="#000" />
            </TouchableOpacity>
          )}

          {/* Bottom Info Panel */}
          <View style={[styles.bottomPanel, isLight && { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="speed" size={20} color={isLight ? "#eab308" : "#facc15"} />
                <Text style={[styles.infoText, isLight && { color: '#111827' }]}>
                  {location.coords.speed ? Math.round(location.coords.speed * 3.6) : 0} km/h
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="gps-fixed" size={20} color="#4ade80" />
                <Text style={[styles.infoText, isLight && { color: '#111827' }]}>
                  ±{Math.round(location.coords.accuracy || 0)}m
                </Text>
              </View>
            </View>
            <Text style={[styles.latLngText, isLight && { color: '#6b7280' }]}>
              {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#facc15',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#facc15',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  latLngText: {
    color: '#9ca3af', 
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
