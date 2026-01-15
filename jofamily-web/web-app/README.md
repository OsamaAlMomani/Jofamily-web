# JoFamily Web App (React + Vite)

This folder houses the web client. The monorepo root now groups docs, web, mobile, and functions separately.

## Getting Started
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm run test`
- Build: `npm run build` (outputs to `web-app/dist`)

## Firebase Env Vars (required)
Create `.env` in this folder (copy from `.env.example`). Vite expects `VITE_FIREBASE_*` keys; missing keys will throw at startup.

## Docs and References
- WebRTC walkthrough: ../docs/guides/RTC.md
- Repo-level index: ../docs/README.md

## Notes
- Vite config: vite.config.ts (react-swc, deduped react packages)
- Testing: vitest.config.ts (jsdom, setup file under src/tests/setup.ts)
