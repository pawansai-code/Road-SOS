import { GoogleSignin } from '@react-native-google-signin/google-signin';

// TODO: Replace with your actual Web Client ID from the Firebase Console or the updated google-services.json
// You can find this in google-services.json under client[0].oauth_client
// after you add your SHA-1 footprint to the Firebase project.
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID_HERE';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
  });
}
