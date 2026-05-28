import NetInfo from "@react-native-community/netinfo";

// Check current internet connectivity status
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();

    return state.isConnected === true;
  } catch (error) {

    // Return false if network check fails
    console.log("NETWORK CHECK ERROR:", error);
    return false;
  }
};