# Road-SOS Project Overview

## 1. Introduction
Road-SOS is a comprehensive mobile application designed to provide rapid, reliable assistance during critical emergencies. With a single tap, the app alerts pre-configured emergency contacts and relevant authorities (Police, Fire, Medical) while sharing the user's real-time location and vital medical profile. It acts as a digital lifeline when every second counts.

## 2. Problem Statement
In emergency situations such as road accidents, sudden medical crises, or personal security threats, time is the most critical factor. Traditional emergency procedures require manually dialing numbers, explaining the situation, and describing the location—which may be difficult if the user is panicked, injured, or in an unfamiliar area. Furthermore, first responders often lack immediate access to the victim's critical medical history (e.g., blood group, allergies), and personal loved ones are usually left in the dark until much later.

## 3. Tech Stack
The project utilizes a modern, robust tech stack to ensure cross-platform compatibility and high reliability:
*   **Frontend (Mobile App):** React Native & Expo
*   **Navigation & State:** React Navigation, Redux Toolkit (`react-redux`)
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **Native Device Features:** Expo Location (GPS tracking), Expo SMS (messaging), Expo Image Picker
*   **Backend / API:** Python, Django, Django REST Framework
*   **Database:** PostgreSQL (`psycopg2-binary`)
*   **Infrastructure & Build:** Firebase (Authentication), Expo Application Services (EAS)

## 4. Architecture
Road-SOS employs a standard **Client-Server Architecture**:
*   **Client (Frontend):** The Expo app acts as the primary interface. It relies heavily on device hardware (GPS module for location, cellular module for SMS). State management is handled by Redux, dividing logic into specific slices (`userSlice`, `sosSlice`, `contactsSlice`).
*   **Server (Backend):** A Django REST Framework backend exposes a set of secure RESTful API endpoints. It processes incoming SOS triggers, stores emergency contact lists, manages user medical profiles, and logs historical SOS events.
*   **Data Flow Example (SOS Trigger):** When a user taps the SOS button, the app fetches current GPS coordinates via `expo-location`. It simultaneously makes a `POST` request to `/api/sos/trigger/` with the payload, and uses `expo-sms` to dispatch an auto-generated text message template to up to 5 stored emergency contacts.

## 5. Existing Solution
Current existing solutions largely consist of:
*   **OS-Level SOS Features:** Native phone shortcuts (like holding the power button) which dial 911 and send a basic text. However, they are rigid, do not share detailed medical profiles, and lack a dedicated dashboard for managing emergency data.
*   **Disjointed Apps:** Separate apps for location sharing (like WhatsApp live location) and separate apps for medical ID, forcing the user to juggle multiple interfaces during a panic scenario.

## 6. Proposed Solution
Road-SOS proposes a **unified, one-stop ecosystem** for emergency response:
*   **Single-Tap SOS:** Immediately triggers workflows for specific emergency types (Medical, Fire, Police).
*   **Automated Communication:** Automatically dispatches a formatted SMS containing a dynamic template with the user's live location to saved contacts.
*   **Centralized Medical Profile:** Stores crucial data (Blood Group, Medical Notes) that is immediately accessible and syncs with the backend `/api/users/profile/`.
*   **Event Logging:** Maintains an audit trail of past emergencies via the `/api/services/sos-event/` endpoint for future reference or medical tracking.

## 7. Source Code Structure
The codebase is structured to be highly scalable and maintainable:
*   `frontend/src/screens/`: Contains the primary user views (`HelpScreen.tsx`, `LiveTrackingScreen.tsx`, `HomeScreen.tsx`).
*   `frontend/src/store/slices/`: Contains Redux logic separating domain concerns (e.g., `userSlice.ts` for profile data, `contactsSlice.ts` for emergency contacts).
*   `frontend/src/services/`: Axios configurations and API clients interfacing with the Django backend.
*   `frontend/app.json` & `eas.json`: Configuration files for Expo and the EAS build pipeline.
*   `backend/`: Contains the Django project, models for PostgreSQL, and API viewsets.

## 8. Final Outcome
The final outcome is a fully functional, cross-platform (iOS and Android) mobile application. It successfully bridges the communication gap during crises, allowing users to feel safer and more prepared. It enables emergency responders to act faster with more context, and ensures loved ones are notified instantly with accurate tracking links.

## 9. Conclusion
Road-SOS successfully addresses a critical flaw in traditional emergency reporting by automating location sharing and notification dispatch. By leveraging native device APIs (GPS, SMS) alongside a robust Django backend, it provides a stable, user-centric tool that has the genuine potential to save lives in critical moments.
