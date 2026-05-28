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
import { signInWithEmailAndPassword } from 'firebase/auth';
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

  useEffect(() => {
    // No native Google config needed for JS SDK
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

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In Disabled',
      'Google Sign-in requires compiling a native app. While testing in Expo Go, please use Email/Password authentication instead.'
    );
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
            <TouchableOpacity className="mt-3 items-end">
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

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
