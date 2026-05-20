import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/firebase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Configure Google Sign-In when component mounts
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      configureGoogleSignIn();
    }
  }, []);

  const handleLogin = async () => {
    try {
      if (email && password) {
        await auth().signInWithEmailAndPassword(email, password);
        navigation.replace('Home');
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      console.warn("Google Sign-In is not supported natively on web without extra setup.");
      return;
    }
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const { data } = await GoogleSignin.signIn();

      if (data?.idToken) {
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);

        // Sign-in the user with the credential
        await auth().signInWithCredential(googleCredential);
        navigation.replace('Home');
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
          <View className="mb-12 mt-8">
          <Text className="text-4xl font-bold text-yellow-400 mb-2">Welcome Back</Text>
          <Text className="text-gray-400 text-base">Sign in to continue</Text>
        </View>

        <View className="mb-8">
          <View className="mb-4">
            <Text className="text-yellow-400 mb-2 font-semibold">Email</Text>
            <TextInput
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View className="mb-2">
            <Text className="text-yellow-400 mb-2 font-semibold">Password</Text>
            <TextInput
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter your password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity className="items-end mb-6">
            <Text className="text-yellow-400 text-sm font-semibold">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full bg-yellow-400 rounded-xl py-4 items-center mb-6"
          onPress={handleLogin}
        >
          <Text className="text-black font-bold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-gray-800" />
          <Text className="text-gray-500 px-4">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-800" />
        </View>

        <TouchableOpacity 
          className="w-full bg-white rounded-xl py-4 flex-row justify-center items-center mb-8"
          onPress={handleGoogleLogin}
        >
          <View className="w-6 h-6 mr-3 bg-gray-200 rounded-full items-center justify-center">
            {/* Placeholder for Google Icon */}
            <Text className="font-bold text-black">G</Text>
          </View>
          <Text className="text-black font-bold text-lg">Continue with Google</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-auto mb-8">
          <Text className="text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-yellow-400 font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
