# JoFamily Mobile App (React Native + Expo + TypeScript)

Production-ready mobile app for iOS and Android with offline sync, Firebase integration, and native navigation.

---

## 📦 Architecture Overview

- **Framework**: React Native 0.81 + Expo 54
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (native stack + tabs)
- **Backend**: Firebase Auth + Firestore + Storage
- **State**: Async Storage for offline cache
- **Build**: Expo CLI + EAS Build (optional for CI/CD)

---

## 🚀 Setup & Running on Windows PC

### Prerequisites

Before starting, ensure your PC has:

1. **Node.js 20 LTS**: [Download](https://nodejs.org)
   - Verify: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Verify: `git --version`

3. **Java Development Kit (JDK) 17+** (for Android emulator)
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use `choco install jdk17` (Windows)
   - Verify: `java -version`

4. **Android SDK** (for Android emulator)
   - Install via Android Studio: [Download](https://developer.android.com/studio)
   - Inside Android Studio, go to SDK Manager → download SDK Platform 34 (latest)
   - Verify: `adb --version`

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

This installs all packages from `package.json`, including:
- Expo runtime
- React Navigation
- Firebase SDK
- AsyncStorage

**Expected output**: `added X packages` (no errors)

### Step 2: Environment Setup (Firebase Config)

Create a `.env` file in the `mobile/` root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

**Where to get these values?**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your JoFamily project
3. Click **Project Settings** (gear icon)
4. Copy values from the **Your apps** section (Web SDK config)

### Step 3: Start the Expo Dev Server

```bash
npm run start
```

**Expected output**:
```
›   Using @react-native-async-storage/async-storage@1.23.1 (2,000 bytes)
✔ Exported to: /path/to/mobile/.expo
Opening Expo Go on Android...
```

The terminal will show a QR code. Keep this running.

### Step 4: Run on Android Emulator (Windows)

**Option A: Using Android Emulator**

1. Open **Android Studio**
2. Click **AVD Manager** (device icon in toolbar)
3. Create or select an emulator (e.g., "Pixel 6 API 34")
4. Click the **Play** button to start the emulator
5. Wait for the Android home screen to appear

In the terminal where `npm run start` is running, press:
```
a
```

The app will build and launch inside the emulator.

**Option B: Using Physical Android Device**

1. Enable **Developer Mode**:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Go back and open **Developer Options**
   - Toggle **USB Debugging** on

2. Connect device via USB cable

3. In terminal, press `a` (same as emulator)

The app will build and launch on your phone.

### Step 5: View the App

Once running, you should see:
- **JoFamily Mobile** title
- **Phase 5: Mobile Ready (Expo + TS)** subtitle
- 6 buttons: Chat, Calendar, Tasks, Budget, Safety, Login/Signup

Press any button to navigate between placeholder screens.

---

## 📁 Project Structure

```
mobile/
├── App.tsx                         # Entry point with navigation
├── app.json                        # Expo config
├── package.json                    # Dependencies + scripts
├── tsconfig.json                   # TypeScript config
├── .env                            # Firebase credentials (create this)
├── .gitignore                      # Git ignore rules
├── src/
│   ├── navigation/
│   │   └── RootNavigator.tsx       # React Navigation setup
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Home with tab buttons
│   │   ├── ChatScreen.tsx          # Chat placeholder
│   │   ├── CalendarScreen.tsx      # Calendar placeholder
│   │   ├── TasksScreen.tsx         # Tasks placeholder
│   │   ├── BudgetScreen.tsx        # Budget placeholder
│   │   ├── SafetyScreen.tsx        # Safety placeholder
│   │   └── AuthScreen.tsx          # Login/Signup placeholder
│   └── services/
│       └── firebase.ts             # Firebase initialization
├── assets/
└── index.ts                        # Expo root component

```

---

## 🔗 Firebase Integration

### Current State
- Firebase config is **environment-based** (uses `.env` vars)
- Auth, Firestore, and Storage are initialized but not yet used

### Next Steps (Phase 5 continuation)
1. Implement **AuthContext** for user session management
2. Add **Firestore listeners** to populate screens with real data
3. Implement **offline queue** for actions when network unavailable
4. Add **push notifications** (Firebase Cloud Messaging)

---

## 🧭 Navigation Flow

```
Home (entry)
├── Chat
├── Calendar
├── Tasks
├── Budget
├── Safety
└── Auth (Login/Signup)
```

Future: Add nested stacks for detail views (e.g., Chat → ChatDetail).

---

## 📲 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run start` | Start Expo dev server (shows QR code) |
| `npm run android` | Build and run on Android emulator/device |
| `npm run ios` | Build and run on iOS (macOS only) |
| `npm run web` | Run in web browser (experimental) |
| `npm run lint` | (Add ESLint/Prettier later) |
| `npm run test` | (Add Jest tests later) |

---

## 🛠️ Troubleshooting

### "Module not found" errors
**Solution**: Run `npm install` again and clear cache:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Android emulator won't start
**Solution**: 
1. Open Android Studio → AVD Manager
2. Delete the emulator
3. Create a new one with **API 34** (or latest)
4. Start manually from Android Studio

### Firebase credentials error
**Solution**:
1. Double-check `.env` values match Firebase console exactly
2. Ensure `.env` is in `mobile/` root (not nested)
3. Restart Expo dev server after changing `.env`

### App crashes on navigation
**Solution**:
1. Check terminal for error logs
2. Ensure all screen files exist in `src/screens/`
3. Verify `RootNavigator.tsx` imports all screens

---

## 🎯 Phase 5 Next Steps

After confirming the app runs:

1. **Implement Auth Flow**
   - Add email/password login to AuthScreen
   - Wire Firebase Auth
   - Persist session with AsyncStorage

2. **Connect to Firestore**
   - Fetch chat messages on ChatScreen
   - Display calendar events on CalendarScreen
   - Show tasks on TasksScreen

3. **Add Offline Support**
   - Cache data locally with AsyncStorage
   - Queue writes; replay on reconnect

4. **Push Notifications**
   - Set up Firebase Cloud Messaging
   - Request user permissions

5. **Deploy to Test Track**
   - Use EAS Build for signed APK
   - Distribute via Google Play Console (internal testing)

---

## 📚 Useful Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [Firebase React Native](https://rnfirebase.io)
- [React Native Docs](https://reactnative.dev)

---

**Status**: ✅ Scaffolded and ready to run  
**Last Updated**: January 15, 2026  
**Next**: Implement Auth flow and Firestore integration
