import AsyncStorage from "@react-native-async-storage/async-storage";

// Local storage key for offline SOS queue
const OFFLINE_SOS_KEY = "offline_sos_queue";

// Save offline SOS incident locally
export const saveOfflineSOS = async (incident: any) => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_SOS_KEY);

    const incidents = existing ? JSON.parse(existing) : [];

    incidents.push({
      ...incident,
      timestamp: new Date().toISOString(),
      synced: false,
    });

    await AsyncStorage.setItem(
      OFFLINE_SOS_KEY,
      JSON.stringify(incidents)
    );
  } catch (error) {
    console.log("OFFLINE STORAGE ERROR:", error);
  }
};

// Retrieve all stored offline SOS incidents
export const getOfflineSOSQueue = async () => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_SOS_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("FETCH OFFLINE SOS ERROR:", error);
    return [];
  }
};

// Clear offline SOS queue after successful synchronization
export const clearOfflineSOSQueue = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_SOS_KEY);
  } catch (error) {
    console.log("CLEAR OFFLINE SOS ERROR:", error);
  }
};