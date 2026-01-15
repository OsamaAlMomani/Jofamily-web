# Environment Prep for Next Systems (Phase 5+)

## Accounts & Access
- Ensure Google Cloud project with billing enabled (Vertex AI, BigQuery, Cloud Storage, Cloud KMS).
- App Store Connect + Google Play Console accounts with certificates/keystores prepared.
- Code signing assets: iOS distribution cert + provisioning profiles; Android keystore; Electron code-sign certs (Win/Mac).

## Tooling & Runtimes
- Node.js 20 LTS; pnpm or npm consistent across web/mobile/desktop.
- Xcode (latest stable) + CocoaPods; Android Studio (latest) with SDKs; Java 17 for Android builds.
- Electron Builder CLI for desktop packaging.
- Firebase CLI authenticated; gcloud CLI authenticated.

## Repos & Monorepo Layout (proposed)
```
root/
  web/        # existing Vite app
  mobile/     # React Native app
  desktop/    # Electron app (shared React renderer)
  shared/     # shared UI/components/hooks/services/types
  infra/      # IaC scripts, CI/CD workflows
```

## Baseline Commands (to add in scripts)
- Web: `npm run lint && npm run build`
- Mobile: `npm run lint:mobile && npm run build:ios && npm run build:android`
- Desktop: `npm run lint:desktop && npm run build:desktop`
- ML: `npm run ml:train && npm run ml:serve`

## CI/CD Outline
- GitHub Actions: matrix for web/mobile/desktop lint+test+build.
- Signing: use secure secrets storage for certs/keys; never commit secrets.
- Caching: node_modules/pods/gradle caches for faster builds.

## Security & Compliance
- Enforce least-privilege IAM; separate service accounts per service.
- Enable Cloud KMS; store secrets in Secret Manager; rotate keys.
- Add audit logging on GCP; set retention policies.

## Observability
- Enable Cloud Logging/Monitoring/Trace for backend; Sentry for clients.
- Set SLIs: web <200ms TTFB, ML p95 <500ms, mobile crash-free >99%.

## Data & ML
- Create BigQuery dataset and buckets for training data.
- Define data contracts for events; add validation in pipelines.
- Set up model registry/versioning in Vertex AI.

## Next Actions (this repo)
- Add scripts placeholders to package.json for future mobile/desktop/ML commands.
- Add CI workflow templates under .github/workflows (web first, mobile/desktop soon).
- Add shared/ package for common types and services when monorepo is created.
