import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/firebase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Configure Google Sign-In when component mounts
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      configureGoogleSignIn();
    }
  }, []);

  const handleSignUp = async () => {
    try {
      if (email && password && password === confirmPassword) {
        // Create user with Firebase Auth
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
          displayName: name
        });
        
        navigation.replace('Home');
      } else {
        console.warn("Passwords don't match or fields are empty");
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
    }
  };

  const handleGoogleSignUp = async () => {
    if (Platform.OS === 'web') {
      console.warn("Google Sign-In is not supported natively on web without extra setup.");
      return;
    }
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { data } = await GoogleSignin.signIn();

      if (data?.idToken) {
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
        await auth().signInWithCredential(googleCredential);
        navigation.replace('Home');
      }
    } catch (error) {
      console.error("Google Sign Up Error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 24 }}>
          <View className="mb-8 mt-8">
            <Text className="text-4xl font-bold text-yellow-400 mb-2">Create Account</Text>
            <Text className="text-gray-400 text-base">Join Road-SOS today</Text>
          </View>

          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-semibold">Full Name</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white"
                placeholder="Enter your full name"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>
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
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-semibold">Password</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white"
                placeholder="Create a password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-semibold">Confirm Password</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 text-white"
                placeholder="Confirm your password"
                placeholderTextColor="#6b7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            className="w-full bg-yellow-400 rounded-xl py-4 items-center mb-6"
            onPress={handleSignUp}
          >
            <Text className="text-black font-bold text-lg">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-[1px] bg-gray-800" />
            <Text className="text-gray-500 px-4">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-800" />
          </View>

          <TouchableOpacity 
            className="w-full bg-white rounded-xl py-4 flex-row justify-center items-center mb-8"
            onPress={handleGoogleSignUp}
          >
            <View className="w-6 h-6 mr-3 bg-gray-200 rounded-full items-center justify-center">
              <Text className="font-bold text-black">G</Text>
            </View>
            <Text className="text-black font-bold text-lg">Sign Up with Google</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-auto mb-4">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-yellow-400 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
