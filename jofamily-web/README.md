# JoFamily Workspace

Monorepo layout regrouped by domain (docs, web app, mobile, functions).

## Structure
- docs/ — domain-sorted documentation (see docs/README.md)
- web-app/ — React + Vite web client (TypeScript)
- mobile/ — React Native + Expo app (TypeScript)
- functions/ — Firebase Cloud Functions
- .firebase/, firebase.json — Firebase hosting/config

## Web App (Vite)
- Location: web-app/
- Commands (run inside web-app/):
  - npm install
  - npm run dev
  - npm run build (outputs to web-app/dist)
  - npm run test
- Hosting: firebase.json points to web-app/dist (after build).

## Mobile App (Expo)
- Location: mobile/
- Setup and run steps: see mobile/README.md (Windows walkthrough included).

## Documentation
- Hub: docs/README.md (links by domain)
- Guides and references live under docs/guides/.

## Notes
- Old web root files (src, public, configs) now live under web-app/.
- Delete stale node_modules at the repo root after reinstalling inside web-app/ to save space.
