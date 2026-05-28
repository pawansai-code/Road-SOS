import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebaseAuth';
import { useAppDispatch } from '../../../store/hooks';
import { setAuthLoading, setAuthSuccess, setAuthError } from '../../../store/slices/authSlice';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type AuthScreenProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<AuthScreenProp>();
  const dispatch = useAppDispatch();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Optionally update user profile with full name in Firebase
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // The backend will create the user record when the X-Firebase-Uid header is passed in subsequent requests
      dispatch(setAuthSuccess(userCredential.user.uid));
    } catch (error: any) {
      console.log('Signup error:', error);
      dispatch(setAuthError(error.message));
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black px-6">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          
          {/* Header */}
          <View className="mb-8 mt-10">
            <Text className="text-white text-4xl font-bold tracking-tight">
              Create <Text className="text-yellow-400">Account</Text>
            </Text>
            <Text className="text-gray-400 text-base mt-2">
              Sign up to get started with ARAN
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6 mb-4">
            
            <View>
              <Text className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</Text>
              <TextInput
                className="bg-[#0f172a] text-white rounded-2xl px-5 py-4 text-base"
                placeholder="Enter your full name"
                placeholderTextColor="#64748b"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View className="mt-5">
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
                placeholder="Create a password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="mt-5">
              <Text className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Confirm Password</Text>
              <TextInput
                className="bg-[#0f172a] text-white rounded-2xl px-5 py-4 text-base"
                placeholder="Confirm your password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

          </View>

          {/* Action Buttons */}
          <View className="mt-8">
            <TouchableOpacity 
              className="bg-yellow-400 rounded-full py-4 items-center justify-center flex-row shadow-lg shadow-yellow-400/20"
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black text-lg font-bold">SIGN UP</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-12 mb-6">
            <Text className="text-gray-400 text-base">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-yellow-400 text-base font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
