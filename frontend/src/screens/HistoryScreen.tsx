// @ts-nocheck
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearHistory } from '../store/slices/sosSlice';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.sos.history);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your SOS history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => dispatch(clearHistory()) 
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 flex-row items-center shadow-lg">
        <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mr-4 border border-red-500/30">
          <MaterialIcons name="emergency" size={24} color="#ef4444" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base mb-1">{item.eventType}</Text>
          <View className="flex-row items-center">
            <MaterialIcons name="event" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-1 mr-3">{formattedDate}</Text>
            <MaterialIcons name="access-time" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-1">{formattedTime}</Text>
          </View>
        </View>
        <View className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <Text className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Triggered</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-black border-b border-gray-900">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-900"
        >
          <MaterialIcons name="arrow-back" size={24} color="#facc15" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-bold">SOS History</Text>
        
        <TouchableOpacity 
          onPress={handleClearHistory}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-900"
          disabled={history.length === 0}
        >
          <MaterialIcons name="delete-outline" size={22} color={history.length === 0 ? "#4b5563" : "#ef4444"} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-gray-900 items-center justify-center mb-6 border border-gray-800">
              <MaterialIcons name="history" size={48} color="#4b5563" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No SOS History</Text>
            <Text className="text-gray-400 text-center text-sm px-8">
              You haven't triggered any emergency requests yet. Stay safe!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
