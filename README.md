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
- Deploy: `npm run build && firebase deploy --only hosting`

## Firebase Env Vars (required)
Create `.env` in this folder (copy from `.env.example`). Vite expects `VITE_FIREBASE_*` keys.

## Documentation
- Hub: docs/README.md (links by domain)
- WebRTC walkthrough: docs/guides/RTC.md

