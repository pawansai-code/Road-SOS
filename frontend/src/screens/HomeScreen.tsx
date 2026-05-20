import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { triggerSOS, cancelSOS } from '../store/slices/sosSlice';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { isEmergencyActive, lastUpdated } = useAppSelector((state) => state.sos);

  const handleSOSPress = () => {
    if (isEmergencyActive) {
      dispatch(cancelSOS());
    } else {
      dispatch(triggerSOS());
    }
  };

  const QuickAction = ({ icon, label, isSOS = false }: { icon: any, label: string, isSOS?: boolean }) => (
    <TouchableOpacity className="w-[23%] items-center mb-6">
      <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 shadow-sm ${isSOS ? 'bg-red-600' : 'bg-gray-900 border border-gray-800'}`}>
        {isSOS ? (
          <Text className="text-white font-black text-sm">SOS</Text>
        ) : (
          <MaterialIcons name={icon} size={28} color="#facc15" />
        )}
      </View>
      <Text className="text-gray-400 text-xs text-center font-medium" numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );

  const EmergencyService = ({ icon, label }: { icon: any, label: string }) => (
    <TouchableOpacity className="w-[23%] bg-gray-900 border border-gray-800 rounded-2xl items-center justify-center p-3 mb-4 shadow-sm">
      <MaterialIcons name={icon} size={28} color="#facc15" />
      <Text className="text-white font-bold text-[10px] mt-2 text-center" numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-black">
        <TouchableOpacity>
          <MaterialIcons name="menu" size={28} color="#facc15" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold tracking-wider">
          ROAD <Text className="text-yellow-400">SOS</Text>
        </Text>
        <TouchableOpacity>
          <MaterialIcons name="info-outline" size={26} color="#facc15" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        
        {/* Main Banner */}
        <View className="flex-row mt-4 mb-6">
          <View className="flex-1 bg-gray-900 border border-gray-800 rounded-3xl p-5 mr-3 overflow-hidden justify-center relative">
            <View className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -mr-10 -mt-10" />
            <Text className="text-white text-sm font-medium leading-5 mb-1 z-10">
              All-In-One Emergency Number
            </Text>
            <Text className="text-gray-400 text-xs leading-4 z-10 w-2/3">
              Emergency Services in One Place{'\n'}
              Emergency Trips When Needed{'\n'}
              Specials with Special Needs
            </Text>
            <View className="absolute right-4 top-1/2 -translate-y-1/2 z-0">
              <Text className="text-5xl font-black text-yellow-400 tracking-tighter" style={{ textShadowColor: 'rgba(250, 204, 21, 0.3)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 8 }}>112</Text>
            </View>
          </View>
          
          <View className="w-1/3 bg-gray-900 border border-gray-800 rounded-3xl p-4 justify-center">
             <Text className="text-white font-bold mb-2">112 Service</Text>
             <Text className="text-gray-400 text-[10px] leading-4 border-l-2 border-yellow-400 pl-2">
               One App for All{'\n'}
               Request Volunteer{'\n'}
               Get Live Updates{'\n'}
               Share Location
             </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          <QuickAction icon="person-outline" label="Profile" />
          <QuickAction icon="history" label="SOS History" />
          <QuickAction icon="notifications-none" label="Notification" />
          <QuickAction icon="help-outline" label="Top Questions" />
          
          <QuickAction icon="phone-in-talk" label="Dial 112" />
          <QuickAction icon="chat-bubble-outline" label="Chat Us" />
          <QuickAction icon="my-location" label="TrackMe" />
          <TouchableOpacity className="w-[23%] items-center mb-6" onPress={handleSOSPress}>
            <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 shadow-lg ${isEmergencyActive ? 'bg-red-800 border-2 border-red-500' : 'bg-red-600 shadow-red-500/50'}`}>
              <Text className="text-white font-black text-sm">{isEmergencyActive ? 'STOP' : 'SOS'}</Text>
            </View>
            <Text className="text-gray-400 text-xs text-center font-medium">Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Emergency Services */}
        <Text className="text-white font-bold text-lg mb-4">Contact Emergency Services</Text>
        <View className="flex-row flex-wrap justify-between mb-4">
          <EmergencyService icon="local-police" label="POLICE" />
          <EmergencyService icon="local-fire-department" label="FIRE" />
          <EmergencyService icon="local-hospital" label="MEDICAL" />
          <EmergencyService icon="storm" label="DISASTER" />
          
          <EmergencyService icon="woman" label="WOMAN" />
          <EmergencyService icon="child-care" label="CHILD" />
          <EmergencyService icon="elderly" label="ELDERLY" />
          <EmergencyService icon="train" label="RAILWAY" />
        </View>

        {/* Text Input */}
        <View className="flex-row items-center bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2 mt-2 mb-4">
          <TextInput 
            className="flex-1 text-white h-10"
            placeholder="Briefly describe the situation."
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity>
            <MaterialIcons name="mic" size={24} color="#facc15" />
          </TouchableOpacity>
        </View>

        {/* Location Banner */}
        <View className="flex-row items-center bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <MaterialIcons name="location-on" size={24} color="#ef4444" />
          <Text className="text-white font-medium ml-2 flex-1">Fetching location...</Text>
        </View>

        {/* Permission Notice */}
        <View className="flex-row items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
          <Text className="text-gray-400 text-xs flex-1 mr-4 leading-5">
            Location permission is required. Please enable it in Settings
          </Text>
          <TouchableOpacity className="bg-white rounded-full px-4 py-2">
            <Text className="text-black text-xs font-bold">Settings</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
