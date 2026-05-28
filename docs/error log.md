# ROAD SOS - ERROR LOG & TROUBLESHOOTING GUIDE

## 📱 Frontend & UI Issues

### 1. SOS Button Overflow & Layout Breakage (Tamil/Malayalam)
* **Symptoms:** When switching the application language to Tamil or Malayalam, the text bleeds out of the circular SOS button and warps the surrounding UI.
* **Cause:** Translated strings for emergency prompts were significantly longer than English, and UI components had fixed dimensions without textual constraints.
* **Solution:** Applied `adjustsFontSizeToFit={true}` and restricted the text with `numberOfLines={1}` on critical elements to force the font to scale dynamically.

### 2. TS2769: No overload matches this call (i18next Initialization)
* **Symptoms:** Error encountered while setting up the `i18next` configuration for React Native.
* **Cause:** `i18next` requires a compatibility flag in React Native, as it attempts to use JSON v4 format parsing which isn't natively supported by all JS engines out of the box.
* **Solution:** Added `compatibilityJSON: 'v4'` to the `i18n.init()` configuration payload.

### 3. Syntax Error: '{' or JSX element expected
* **Symptoms:** `error TS1145` encountered during multilingual integration in `ProfileScreen.tsx`.
* **Cause:** Raw string placeholders with translation functions were written as `placeholder=t("key")` instead of wrapping the JavaScript expression in curly braces.
* **Solution:** Corrected all occurrences to properly enclose the function calls: `placeholder={t("key")}`.

### 4. ReferenceError: Property 'colorScheme' doesn't exist
* **Symptoms:** Encountered after integrating NativeWind and light/dark mode themes.
* **Cause:** The `colorScheme` property was being destructured or referenced outside of the functional component's scope (e.g., inside static StyleSheet declarations).
* **Solution:** Restructured UI components to use dynamic style generation, creating helper functions (e.g., `getStyles(isLight)`) inside or called from within the component body.

### 5. Expo Go App Crashing / "Components Messed Up"
* **Symptoms:** The app wouldn't load or was visually corrupted in Expo Go.
* **Cause:** Syntax errors causing Metro bundler to fail compilation silently, coupled with UI layout breaking due to language string lengths.
* **Solution:** Cleared syntax errors using TypeScript (`tsc --noEmit`), fixed JSX props, and successfully recompiled the bundle.

---

## 🔌 API & Connectivity Issues

### 1. One-tap big SOS button failing silently
* **Symptoms:** Tapping the SOS button finishes the countdown but no map link is generated and no backend trigger happens.
* **Cause:** The `BASE_URL` in `HomeScreen.tsx` was hardcoded to an old IP address (e.g. `10.90.25.192`), failing to reach the new backend IP (`192.168.43.71`).
* **Solution:** Updated `BASE_URL` in `HomeScreen.tsx` to match the active backend IP address, aligning it with `API_BASE_URL` in `userSlice.ts` and `sosSlice.ts`.

### 2. Database data exists, but frontend asks for new data (Empty Profile)
* **Symptoms:** Backend has user data, but the mobile app's Profile screen acts like no data exists.
* **Cause:** The app is fetching from a hardcoded IP address that no longer matches the actual Wi-Fi IP address or emulator setup.
* **Solution:** Run `ipconfig`, find current IPv4 Address. Update `API_BASE_URL` in `src/store/slices/userSlice.ts` (e.g., `http://192.168.x.x:8000/api` or `10.0.2.2` for emulator).

---

## 🛠 Build & Configuration Issues

### 1. Unable to resolve "react-native-get-random-values"
* **Symptoms:** Android Bundling fails with an import resolution error on `index.ts` / `sosSlice.ts`.
* **Cause:** Tried to import `react-native-get-random-values` and `uuid`, but they were not installed in `package.json`.
* **Solution:** Remove unused imports if a simple ID (`Date.now()`) suffices, or install packages via `npm install uuid react-native-get-random-values`.

### 2. Native Packages / Modules not found or not linking
* **Symptoms:** Errors like "Native module cannot be null", "Invariant Violation", or app crashing when using new libraries (camera, location, maps).
* **Cause:** Running inside standard 'Expo Go', which only includes pre-defined native modules. It cannot run custom native code on the fly.
* **Solution:** Stop server, run `npx expo prebuild`, then `npx expo run:android` to compile an Android APK with new native code included.

---

## ⚠️ Pending Database Architecture Decisions

### 1. Data isn't saving to the Database (sos_event_logs)
* **Context:** The `sos_event_logs` table requires an `incident_id` linking to `sos_incidents` (Foreign Key), and `event_type` is an ENUM restricting values (e.g., SOS_CREATED). Trying to save "POLICE" directly causes a crash.
* **Proposed Solutions:**
  * **Option A (Recommended for MVP):** Change the Django model to create a new table (`service_call_logs`) that matches the simple structure (firebase_uid, event_type, timestamp).
  * **Option B:** If `sos_event_logs` must be used, first create a dummy "Incident", use `CALL_TRIGGERED` as event_type, and save "POLICE" inside the `event_message` column.



## backend server run -->  python manage.py runserver 0.0.0.0:8000
ipconfig for ipv4 address based on that we need to change the last digits in the slices located in the frontend.
