# Environment Setup Guide

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **Git**: For version control
- **VSCode**: Recommended IDE with extensions

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd jofamily-web
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- **React 19**: UI framework
- **Vite**: Build tool
- **TypeScript**: Type safety
- **Firebase**: Backend services
- **React Router**: Navigation
- **Vitest**: Testing framework
- **Testing Library**: Component testing utilities

## Step 3: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enable:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Cloud Storage

### Get Firebase Credentials

1. Project Settings → General tab
2. Copy the SDK config

### Create `.env` File

```bash
cp .env.example .env
```

Update `.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

⚠️ **Never commit `.env` file to git!** Add to `.gitignore` if not already there.

## Step 4: VSCode Extensions (Recommended)

For optimal development experience, install:

```
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- TypeScript Vue Plugin (Vue.volar)
- Thunder Client (rangav.vscode-thunder-client)
```

Or import from `.vscode/extensions.json` if available.

## Step 5: Verify Installation

```bash
# Check Node version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+

# Run dev server
npm run dev
# Opens http://localhost:5173

# Run tests
npm test -- --run

# Build project
npm run build
```

## Step 6: Configure IDE

### VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Format Code Before Commit

Install husky for git hooks:

```bash
npm install husky lint-staged --save-dev
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

## Windows-Specific Setup

### Terminal Setup

Use PowerShell or WSL2 for best experience:

```bash
# PowerShell
npm install
npm run dev

# WSL2
wsl
npm install
npm run dev
```

### Path Issues

If npm commands fail on Windows, try:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

## macOS-Specific Setup

### Homebrew (Optional but Recommended)

```bash
# Install Node
brew install node

# Verify installation
node --version
npm --version
```

## Linux-Specific Setup

### Ubuntu/Debian

```bash
# Install Node
sudo apt update
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

## Docker Setup (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

Build and run:

```bash
docker build -t jofamily-web .
docker run -p 5173:5173 jofamily-web
```

## Troubleshooting

### Issue: "Cannot find module 'react'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 already in use

```bash
# Find process using port
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
npm run dev -- --port 3000
```

### Issue: Firebase environment variables not loading

1. Check `.env` file exists in root
2. Variables must start with `VITE_` prefix
3. Restart dev server after updating `.env`
4. Check that `.env` is not in `.gitignore`

### Issue: Tests failing with "Module not found"

```bash
# Clear Vitest cache
npm test -- --clearCache

# Or delete manually
rm -rf node_modules/.vitest
```

### Issue: TypeScript errors in IDE

```bash
# Restart TypeScript server in VSCode
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or regenerate types
npm run type-check
```

## Next Steps

1. Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for project structure
2. Start development server: `npm run dev`
3. Begin working on features
4. Write tests alongside features
5. Build and test: `npm run build && npm test -- --run`

## Getting Help

- Check [Troubleshooting](#troubleshooting) section
- Review error messages carefully
- Check terminal output with `npm test -- --reporter=verbose`
- Use `screen.debug()` in tests to see rendered output
- Visit [Firebase Support](https://firebase.google.com/support)
