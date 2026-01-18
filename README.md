# JoFamily Workspace

Monorepo with React/Vite web app, React Native mobile app, Firebase functions, and organized documentation.

## Structure
- src/, public/ — React web app source
- mobile/ — React Native + Expo app (see mobile/README.md)
- functions/ — Firebase Cloud Functions
- docs/ — domain-sorted documentation (see docs/README.md)
- .firebase/, firebase.json — Firebase hosting/config

## Web App (Vite)
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (outputs to dist/)
- Test: `npm run test`
- Preview locally (Hosting): `npm run serve:hosting`
- Emulate Hosting+Functions+Firestore: `npm run emulate`
- Deploy Hosting+Firestore: `npm run build && npm run deploy`
- Deploy Hosting only: `npm run deploy:hosting`
- Deploy Firestore only: `npm run deploy:firestore`
- Deploy Functions only: `npm run deploy:functions`
- Deploy Everything: `npm run deploy:all`

## Firebase Env Vars (required)
Create `.env` in this folder (copy from `.env.example`). Vite expects `VITE_FIREBASE_*` keys.

Example:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

If you haven't set a default Firebase project yet:

```
npm run firebase:login
npm run firebase:use
```

## Firestore Database
The app uses Cloud Firestore for persistent data storage (finance records).

**Setup:**
1. Enable Firestore in [Firebase Console](https://console.firebase.google.com/project/jofamily-acc6c/firestore)
2. Deploy rules: `npm run deploy:firestore`
3. Data auto-seeds on first dashboard visit

See [docs/setup/FIRESTORE_SETUP.md](docs/setup/FIRESTORE_SETUP.md) for detailed instructions.

## Admin Dashboard
- Access: `/dashboard` (requires admin login)
- Admin email: `momani.322.44157@gmail.com`
- Features: Finance tracking, expected vs actual charts, analytics

## Documentation
- Hub: docs/README.md (links by domain)
- WebRTC walkthrough: docs/guides/RTC.md

