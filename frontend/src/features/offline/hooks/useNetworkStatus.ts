import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { syncOfflineSOS } from "../services/syncOfflineSOS";

// Custom hook to monitor online/offline network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
       // Listen for network connectivity changes
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const connected = state.isConnected === true;

      // Update current network status
      setIsOnline(connected);

      // Automatically sync offline SOS incidents when internet returns
      if (connected) {
        await syncOfflineSOS();
      }
    });
 
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return isOnline;
};