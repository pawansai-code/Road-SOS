import './global.css';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/config/firebase';

export default function App() {

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
