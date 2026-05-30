import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../services/firebaseAuth';
import { useAppDispatch } from '../../../store/hooks';
import { setAuthLoading, setAuthSuccess, setAuthError } from '../../../store/slices/authSlice';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type AuthScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<AuthScreenProp>();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '476256496723-tqtfpv8u8h121gva2i4odbcu0aesfqmp.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    setDevError(null);
    dispatch(setAuthLoading(true));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch(setAuthSuccess(userCredential.user.uid));
    } catch (error: any) {
      console.log('Login error:', error);
      dispatch(setAuthError(error.message));
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      setShowForgotModal(false);
      setResetEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setDevError(null);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error("No ID token found!");
      }

      const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      dispatch(setAuthSuccess(userCredential.user.uid));
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      if (error.code !== 'SIGN_IN_CANCELLED') {
        setDevError(error.message || 'An error occurred during Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 justify-center"
      >
        {/* Header */}
        <View className="mb-8 mt-10">
          <Text className="text-white text-4xl font-bold tracking-tight">
            Welcome <Text className="text-yellow-400">Back</Text>
          </Text>
          <Text className="text-gray-400 text-base mt-2">
            Sign in to continue to ARAN
          </Text>
        </View>

        {/* Developer Error Banner (replicates screenshot) */}
        {devError && (
          <View className="bg-red-950/40 border border-red-900 rounded-2xl p-4 mb-6 flex-row items-center">
            <MaterialIcons name="error-outline" size={24} color="#ef4444" className="mr-3" />
            <Text className="text-red-400 text-xs flex-1 ml-3 leading-5">
              {devError}
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View className="space-y-6 mb-4">
          <View>
            <Text className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Email Address</Text>
            <TextInput
              className="bg-[#0f172a] text-white rounded-2xl px-5 py-4 text-base"
              placeholder="Enter your email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mt-5">
            <Text className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Password</Text>
            <TextInput
              className="bg-[#0f172a] text-white rounded-2xl px-5 py-4 text-base"
              placeholder="Enter your password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity className="mt-3 items-end" onPress={() => setShowForgotModal(true)}>
              <Text className="text-yellow-400 text-sm font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-8">
          <TouchableOpacity 
            className="bg-yellow-400 rounded-full py-4 items-center justify-center flex-row shadow-lg shadow-yellow-400/20"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black text-lg font-bold">SIGN IN</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-gray-800" />
            <Text className="text-gray-500 font-semibold px-4 text-xs">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-800" />
          </View>

          <TouchableOpacity 
            className="bg-[#0f172a] rounded-full py-4 items-center justify-center flex-row"
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <MaterialIcons name="security" size={20} color="#fff" />
            <Text className="text-white text-base font-bold ml-3">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-12 mb-6">
          <Text className="text-gray-400 text-base">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp' as any)}>
            <Text className="text-yellow-400 text-base font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <View className="absolute inset-0 z-50 bg-black/80 justify-center items-center px-6">
            <View className="bg-[#0f172a] w-full rounded-2xl p-6 border border-gray-800 shadow-2xl">
              <Text className="text-white text-xl font-bold mb-2">Reset Password</Text>
              <Text className="text-gray-400 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              <TextInput
                className="bg-black text-white rounded-xl px-4 py-3 text-base border border-gray-700 mb-6"
                placeholder="Email address"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity 
                  onPress={() => setShowForgotModal(false)}
                  className="px-4 py-2"
                >
                  <Text className="text-gray-400 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  className="bg-yellow-400 px-6 py-2 rounded-lg"
                >
                  <Text className="text-black font-bold">Send Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
