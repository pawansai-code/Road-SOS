import axios from "axios";
import { BASE_URL } from "../../../config";

import {
  getOfflineSOSQueue,
  clearOfflineSOSQueue,
} from "./offlineStorageService";

// Prevents multiple sync operations from running simultaneously
let isSyncing = false;

// Backend API endpoint for SOS incident synchronization
const API_URL = `${BASE_URL}/api/sos/trigger/`;

// Sync locally stored offline SOS incidents when internet is restored
export const syncOfflineSOS = async () => {
  // Skip if sync process is already running
  if (isSyncing) {
    return;
  }

  //Lock sync process
  isSyncing = true;

  try {
    // Fetch all pending offline SOS incidents from local storage
    const incidents = await getOfflineSOSQueue();

    // Exit if no pending incidents exist
    if (!incidents.length) {
      return;
    }

    // Send each stored incident to backend API
    for (const incident of incidents) {
      await axios.post(API_URL, {
        latitude: incident.latitude,
        longitude: incident.longitude,
        service_type: incident.service_type,
      });
    }

    // Clear local offline queue after successful sync
    await clearOfflineSOSQueue();
  } catch (error) {

    // Log sync failure errors for debugging
    console.log("SYNC OFFLINE SOS ERROR:", error);
  } finally {

     // Release sync lock after completion
    isSyncing = false;
  }
};