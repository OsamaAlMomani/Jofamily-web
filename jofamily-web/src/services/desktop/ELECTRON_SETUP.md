# Electron Desktop App

React + TypeScript + Electron for Windows, macOS, and Linux.

## Setup

### Create Electron App
```bash
npx create-electron-app desktop --template=webpack
cd desktop
npm install --save-dev typescript @types/node @types/react @types/react-dom
npm install react react-dom react-router-dom axios
npm install electron-updater electron-store electron-squirrel-startup
```

## Structure

```
desktop/
├── src/
│   ├── main/
│   │   └── index.ts         # Main process (window creation, menu)
│   ├── preload/
│   │   └── preload.ts       # Secure IPC bridge
│   ├── renderer/
│   │   ├── App.tsx          # Root component
│   │   ├── index.tsx        # Entry point
│   │   └── screens/
│   │       ├── Dashboard.tsx
│   │       ├── Budget.tsx
│   │       ├── Settings.tsx
│   │       └── Admin.tsx
│   └── shared/
│       └── types.ts         # Shared IPC types
├── assets/
│   ├── icon.png
│   └── tray-icon.png
├── package.json
├── webpack.config.js
└── tsconfig.json
```

## Main Process (src/main/index.ts)

```typescript
import { app, BrowserWindow, Menu, ipcMain, Tray } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../renderer/index.html')}`;
  mainWindow.loadURL(startUrl);

  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  createWindow();
  setupTray();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const setupTray = () => {
  const icon = path.join(__dirname, '../../assets/tray-icon.png');
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show());
};

// IPC: Secure backend communication
ipcMain.handle('api:get-budget', async () => {
  return store.get('budget', {});
});

ipcMain.handle('api:set-budget', async (_, budget) => {
  store.set('budget', budget);
  return true;
});

ipcMain.handle('api:get-app-version', () => app.getVersion());
```

## Preload Script (src/preload/preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('api:get-app-version'),
    getBudget: () => ipcRenderer.invoke('api:get-budget'),
    setBudget: (budget: any) => ipcRenderer.invoke('api:set-budget', budget),
  },
});

declare global {
  interface Window {
    electron: typeof import('./preload').contextBridge;
  }
}
```

## Renderer (src/renderer/App.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Budget from './screens/Budget';
import Settings from './screens/Settings';
import Admin from './screens/Admin';
import './App.css';

export const App: React.FC = () => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.electron.app.getVersion().then(setVersion);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">JoFamily</div>
          <ul>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/budget">Budget</a></li>
            <li><a href="/settings">Settings</a></li>
            <li><a href="/admin">Admin</a></li>
          </ul>
          <div className="version">v{version}</div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
```

## Packaging

### package.json (build scripts)
```json
{
  "main": "src/main/index.js",
  "homepage": "./",
  "build": {
    "appId": "com.jofamily.desktop",
    "productName": "JoFamily",
    "files": [
      "src",
      "assets"
    ],
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  },
  "scripts": {
    "start": "electron-webpack dev",
    "build": "electron-webpack",
    "dist": "electron-builder"
  }
}
```

## Build & Release

```bash
npm run dist          # Creates installers for all platforms
```

Outputs:
- Windows: `dist/JoFamily-Setup-1.0.0.exe` (NSIS installer)
- macOS: `dist/JoFamily-1.0.0.dmg` (DMG installer)
- Linux: `dist/JoFamily-1.0.0.AppImage` (AppImage)
