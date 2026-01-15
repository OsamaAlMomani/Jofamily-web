# Mobile (React Native, Expo, TypeScript)

This guide bootstraps the JoFamily mobile apps (iOS/Android) with Expo + TypeScript.

## Quick Bootstrap (no install changes yet)
1) Install Expo CLI globally (optional): `npm i -g expo`
2) Create the app (TypeScript template):
   ```bash
   npx create-expo-app@latest mobile --template expo-template-blank-typescript
   cd mobile
   npm install
   ```
3) Configure app.json/app.config.ts with app name/bundle IDs.
4) Start dev server: `npm run start`
5) Run platforms:
   - iOS: `npm run ios` (macOS + Xcode)
   - Android: `npm run android` (Android SDK/Emulator or device)

## Core Dependencies to Add
```bash
npm install firebase react-native-safe-area-context react-native-reanimated react-native-gesture-handler
npm install @react-navigation/native @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
```
Expo will auto-configure most native modules.

## Project Structure (proposed)
```
mobile/
  app.config.ts
  package.json
  tsconfig.json
  src/
    app.tsx
    navigation/
    screens/
      HomeScreen.tsx
      ChatScreen.tsx
      CalendarScreen.tsx
      TasksScreen.tsx
      BudgetScreen.tsx
      SafetyScreen.tsx
      Auth/
    components/
    services/
      firebase.ts
      api.ts
    state/
    theme/
```

## Firebase Setup (Expo)
1) Create `src/services/firebase.ts` with Web SDK config (use existing web Firebase config).
2) Use `initializeApp` and `getAuth`/`getFirestore`/`getStorage` from `firebase/app`.
3) For Auth, prefer email/password + OAuth providers (Google/Apple) via Expo AuthSession.

## Navigation Skeleton
- Root stack: Auth stack (Login/Signup) + Main tabs.
- Tabs: Home, Chat, Calendar, Tasks, Budget, Safety.
- Optional nested stack for Room/RTC/Video.

## Offline & Sync Plan
- Use `@react-native-async-storage/async-storage` for lightweight caching.
- Consider WatermelonDB/Realm if heavier offline is required.
- Queue writes offline; replay on reconnect.

## Theming & UI
- Reuse design tokens from web where possible.
- Light/dark themes; match brand colors used in web Home.

## CI/CD Outline
- Add GitHub Actions job (android/ios build) later.
- EAS (Expo Application Services) recommended for signing/build pipelines.

## Next Steps
- Run the bootstrap commands above to generate the Expo app.
- Drop in Firebase config and minimal screens.
- Add navigation + Auth flow + basic tabs.
- Wire analytics/events to align with Phase 5 metrics.
