# ROAD-SOS DEPENDENCIES LIST

-----------------------------------------
1. FRONTEND DEPENDENCIES (React Native / Expo)
-----------------------------------------
Core:
- expo
- react
- react-native

Navigation:
- @react-navigation/native
- @react-navigation/native-stack
- react-native-screens
- react-native-safe-area-context

Styling & UI:
- nativewind
- tailwindcss (dev dependency)
- react-native-maps
- @expo/vector-icons
- react-native-copilot

State Management & API:
- @reduxjs/toolkit
- react-redux
- axios

Native Device Features & Storage:
- expo-location
- expo-sms
- expo-image-picker
- @react-native-async-storage/async-storage

Localization:
- i18next
- react-i18next


-----------------------------------------
2. BACKEND DEPENDENCIES (Python / Django)
-----------------------------------------
Core Framework & API:
- Django
- djangorestframework

Database:
- psycopg2-binary (PostgreSQL adapter)

Security & Environment:
- python-dotenv
- django-cors-headers


# Core Framework
- expo: The React Native framework for cross-platform app development.
- react / react-native: The core libraries for building user interfaces.

# Navigation
- @react-navigation/native: Core navigation library.
- @react-navigation/native-stack: Stack navigator for screen transitions.
- react-native-screens & react-native-safe-area-context: Native screen primitives and safe area padding (required by React Navigation).

# Styling
- nativewind: Allows using Tailwind CSS classes directly in React Native (via the `className` prop).
- tailwindcss (dev dependency): The Tailwind CSS framework, used alongside NativeWind to generate styles.

# State Management & API (Frontend)
- @reduxjs/toolkit & react-redux: Global state management for user, contacts, and SOS sessions.
- axios: Promise-based HTTP client for making API requests to the backend.

# Native Hardware & Device Features (Frontend)
- expo-location: Accessing GPS coordinates for live location tracking.
- expo-sms: Interfacing with the native SMS messaging app to send emergency texts.
- expo-image-picker: Accessing the device camera and gallery for profile photos.
- @react-native-async-storage/async-storage: Persistent offline key-value storage.

# UI & Localization (Frontend)
- i18next & react-i18next: Multi-language localization framework for translating the UI.
- react-native-maps: Rendering interactive maps to display live location.
- @expo/vector-icons: Built-in library for standardized vector icons (MaterialIcons).
- react-native-copilot: Step-by-step onboarding tooltips and walkthroughs.

# Backend Infrastructure & Framework
- Django: The core Python web framework powering the backend.
- djangorestframework: Extension for building RESTful APIs.
- psycopg2-binary: PostgreSQL database adapter for Python.
- python-dotenv: Environment variable management for secure secrets.
- django-cors-headers: Handling Cross-Origin Resource Sharing (CORS) between Expo and Django.
