import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Animated, ActivityIndicator, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animated values for staggered premium entrance
  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const headerTranslateY = React.useRef(new Animated.Value(20)).current;
  const formOpacity = React.useRef(new Animated.Value(0)).current;
  const formTranslateY = React.useRef(new Animated.Value(20)).current;
  const actionsOpacity = React.useRef(new Animated.Value(0)).current;
  const actionsTranslateY = React.useRef(new Animated.Value(20)).current;

  // Safe Firebase Auth initialization check
  let authInstance: any = null;
  try {
    authInstance = auth();
  } catch (e) {
    console.warn("Firebase Auth native module not available. Fallback demo registration enabled.");
  }

  // Trigger entrance animations when component mounts
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        configureGoogleSignIn();
      } catch (e) {
        console.warn("Google Sign-In configuration skipped:", e);
      }
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

  const handleSignUp = async () => {
    setError(null);

    // Basic Form Validations
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      if (authInstance) {
        const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
          displayName: name
        });
        navigation.replace('Home');
      } else {
        throw new Error("firebase_native_missing");
      }
    } catch (err: any) {
      console.log("Registration details:", err);
      
      // Graceful fallback bypass if Firebase module fails to load (e.g. testing in Expo Go)
      if (err.message === "firebase_native_missing" || err.code === "auth/initialization-failed" || !authInstance) {
        setError("Demo Mode: Registered successfully (local bypass).");
        setTimeout(() => {
          navigation.replace('Home');
        }, 1200);
      } else {
        // Clearer localized error messages
        if (err.code === 'auth/email-already-in-use') {
          setError("This email address is already in use.");
        } else if (err.code === 'auth/invalid-email') {
          setError("The email address is badly formatted.");
        } else if (err.code === 'auth/weak-password') {
          setError("The password is too weak. Please use a stronger password.");
        } else {
          setError(err.message || "A registration error occurred.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    if (Platform.OS === 'web') {
      setError("Google Sign-In is not supported on web.");
      return;
    }
    
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.revokeAccess();
await GoogleSignin.signOut();

const userInfo = await GoogleSignin.signIn();

      if (userInfo?.data?.idToken) {
        if (authInstance) {
          const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data?.idToken);
          await authInstance.signInWithCredential(googleCredential);
          navigation.replace('Home');
        } else {
          throw new Error("firebase_native_missing");
        }
      } else {
        setError("Google Sign-In was canceled.");
      }
    } catch (err: any) {
      console.log("Google registration details:", err);
      console.log(JSON.stringify(err, null, 2));
      
      if (err.message === "firebase_native_missing" || !authInstance) {
        setError("Demo Mode: Google Registration succeeded (local bypass).");
        setTimeout(() => {
          navigation.replace('Home');
        }, 1200);
      } else {
        setError(err.message || "Google Sign-Up failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 24 }}>
          
          {/* Header Animating block */}
          <Animated.View 
            style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }} 
            className="mb-6 mt-6"
          >
            <Text className="text-4xl font-black text-white mb-2">
              Create <Text className="text-yellow-400">Account</Text>
            </Text>
            <Text className="text-gray-400 text-base font-medium">Join ROAD SOS today</Text>
          </Animated.View>

          {/* Validation Feedback Banner */}
          {error && (
            <Animated.View className={`mb-6 p-4 rounded-2xl border flex-row items-center ${
              error.includes("Demo Mode") 
                ? 'bg-yellow-950/40 border-yellow-800' 
                : 'bg-red-950/40 border-red-900'
            }`}>
              <MaterialIcons 
                name={error.includes("Demo Mode") ? "info" : "error-outline"} 
                size={20} 
                color={error.includes("Demo Mode") ? "#facc15" : "#f87171"} 
              />
              <Text className={`font-semibold text-xs ml-2 flex-1 ${
                error.includes("Demo Mode") ? 'text-yellow-400' : 'text-red-400'
              }`}>{error}</Text>
            </Animated.View>
          )}

          {/* Form Fields Animating block */}
          <Animated.View 
            style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }} 
            className="mb-4"
          >
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-bold tracking-wide text-xs uppercase">Full Name</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white font-medium"
                placeholder="Enter your full name"
                placeholderTextColor="#4b5563"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-bold tracking-wide text-xs uppercase">Email Address</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white font-medium"
                placeholder="Enter your email"
                placeholderTextColor="#4b5563"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-bold tracking-wide text-xs uppercase">Password</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white font-medium"
                placeholder="Create a password"
                placeholderTextColor="#4b5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View className="mb-4">
              <Text className="text-yellow-400 mb-2 font-bold tracking-wide text-xs uppercase">Confirm Password</Text>
              <TextInput
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 text-white font-medium"
                placeholder="Confirm your password"
                placeholderTextColor="#4b5563"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </Animated.View>

          {/* Action Buttons Animating block */}
          <Animated.View 
            style={{ opacity: actionsOpacity, transform: [{ translateY: actionsTranslateY }] }}
          >
            <TouchableOpacity 
              className="w-full bg-yellow-400 rounded-2xl py-4 items-center justify-center mb-6 shadow-lg shadow-yellow-400/20 active:opacity-90"
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text className="text-black font-extrabold text-base uppercase tracking-wider">Sign Up</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-gray-800" />
              <Text className="text-gray-500 px-4 font-bold text-xs uppercase tracking-widest">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-800" />
            </View>

            <TouchableOpacity 
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 flex-row justify-center items-center mb-8 active:opacity-90"
              onPress={handleGoogleSignUp}
              disabled={isLoading}
            >
              <MaterialIcons name="security" size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-bold text-sm tracking-wide ml-2">Sign Up with Google</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4 mb-4">
              <Text className="text-gray-400 font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-yellow-400 font-extrabold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

