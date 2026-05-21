import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const headerTranslateY = React.useRef(new Animated.Value(20)).current;
  const formOpacity = React.useRef(new Animated.Value(0)).current;
  const formTranslateY = React.useRef(new Animated.Value(20)).current;
  const actionsOpacity = React.useRef(new Animated.Value(0)).current;
  const actionsTranslateY = React.useRef(new Animated.Value(20)).current;

  let authInstance: any = null;
  try {
    authInstance = auth();
  } catch (e) {
    console.warn('Firebase Auth native module not available. Fallback demo authentication enabled.');
  }

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      try { configureGoogleSignIn(); } catch (e) { console.warn('Google Sign-In configuration skipped:', e); }
    }
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(actionsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(actionsTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return; }

    setIsLoading(true);
    try {
      if (authInstance) {
        await authInstance.signInWithEmailAndPassword(email, password);
        navigation.replace('Home');
      } else {
        throw new Error('firebase_native_missing');
      }
    } catch (err: any) {
      if (err.message === 'firebase_native_missing' || !authInstance) {
        setError('Demo Mode: Authenticated successfully (local bypass).');
        setTimeout(() => navigation.replace('Home'), 1200);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is badly formatted.');
      } else {
        setError(err.message || 'An authentication error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    if (Platform.OS === 'web') { setError('Google Sign-In is not supported on web.'); return; }
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();
      if (data?.idToken) {
        if (authInstance) {
          const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
          await authInstance.signInWithCredential(googleCredential);
          navigation.replace('Home');
        } else {
          throw new Error('firebase_native_missing');
        }
      } else {
        setError('Google Sign-In was canceled.');
      }
    } catch (err: any) {
      if (err.message === 'firebase_native_missing' || !authInstance) {
        setError('Demo Mode: Google Login succeeded (local bypass).');
        setTimeout(() => navigation.replace('Home'), 1200);
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDemo = error?.includes('Demo Mode');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View style={[styles.headerBlock, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <Text style={styles.titleText}>
              Welcome <Text style={styles.titleAccent}>Back</Text>
            </Text>
            <Text style={styles.subtitleText}>Sign in to continue to ROAD SOS</Text>
          </Animated.View>

          {/* Error Banner */}
          {error && (
            <View style={[styles.errorBanner, isDemo ? styles.errorBannerDemo : styles.errorBannerError]}>
              <MaterialIcons name={isDemo ? 'info' : 'error-outline'} size={20} color={isDemo ? '#facc15' : '#f87171'} />
              <Text style={[styles.errorBannerText, isDemo ? styles.errorBannerTextDemo : styles.errorBannerTextError]}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <Animated.View style={[{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }, styles.formBlock]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#4b5563"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#4b5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={{ opacity: actionsOpacity, transform: [{ translateY: actionsTranslateY }] }}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? <ActivityIndicator size="small" color="#000000" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={isLoading} activeOpacity={0.85}>
              <MaterialIcons name="security" size={18} color="#ffffff" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.switchLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardView: { flex: 1, paddingHorizontal: 32 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  headerBlock: { marginBottom: 32, marginTop: 24 },
  titleText: { color: '#ffffff', fontSize: 36, fontWeight: '900', marginBottom: 8 },
  titleAccent: { color: '#facc15' },
  subtitleText: { color: '#9ca3af', fontSize: 16, fontWeight: '500' },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorBannerDemo: { backgroundColor: 'rgba(66,32,6,0.4)', borderColor: '#92400e' },
  errorBannerError: { backgroundColor: 'rgba(127,29,29,0.3)', borderColor: '#7f1d1d' },
  errorBannerText: { fontSize: 12, fontWeight: '600', flex: 1, marginLeft: 8 },
  errorBannerTextDemo: { color: '#facc15' },
  errorBannerTextError: { color: '#f87171' },

  // Form
  formBlock: { marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: '#facc15', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: {
    width: '100%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 15,
  },
  forgotBtn: { alignItems: 'flex-end', paddingVertical: 8, marginBottom: 8 },
  forgotText: { color: '#facc15', fontSize: 12, fontWeight: '700' },

  // Actions
  primaryBtn: {
    width: '100%',
    backgroundColor: '#facc15',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryBtnText: { color: '#000000', fontWeight: '800', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1f2937' },
  dividerText: { color: '#6b7280', paddingHorizontal: 16, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  googleBtn: {
    width: '100%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  googleBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  switchText: { color: '#9ca3af', fontWeight: '500' },
  switchLink: { color: '#facc15', fontWeight: '800' },
});
