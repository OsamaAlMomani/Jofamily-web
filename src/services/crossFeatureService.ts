import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ===== Push Notifications =====
export interface PushNotificationSettings {
  userId: string;
  enabled: boolean;
  channels: {
    chat: boolean;
    calendar: boolean;
    tasks: boolean;
    budget: boolean;
    safety: boolean;
  };
}

export async function savePushNotificationSettings(settings: PushNotificationSettings): Promise<void> {
  const settingsCollection = collection(db, 'pushNotificationSettings');
  const q = query(settingsCollection, where('userId', '==', settings.userId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, settings as any);
  } else {
    await addDoc(settingsCollection, settings);
  }
}

export function listenToPushNotifications(
  userId: string,
  callback: (settings: PushNotificationSettings | null) => void
) {
  const settingsCollection = collection(db, 'pushNotificationSettings');
  const q = query(settingsCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const settings = snap.docs[0]?.data() as PushNotificationSettings | undefined;
    callback(settings || null);
  });
}

// ===== Dark Mode =====
export interface UserPreferences {
  userId: string;
  darkMode: boolean;
  language: string;
  timezone: string;
  notificationSound: boolean;
  emailUpdates: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  const prefsCollection = collection(db, 'userPreferences');
  const q = query(prefsCollection, where('userId', '==', preferences.userId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, preferences as any);
  } else {
    await addDoc(prefsCollection, preferences);
  }
}

export function listenToUserPreferences(userId: string, callback: (prefs: UserPreferences) => void) {
  const prefsCollection = collection(db, 'userPreferences');
  const q = query(prefsCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const prefs = snap.docs[0]?.data() as UserPreferences;
    callback(
      prefs || {
        userId,
        darkMode: false,
        language: 'en',
        timezone: 'UTC',
        notificationSound: true,
        emailUpdates: true,
        theme: 'auto',
      }
    );
  });
}

// ===== User Profiles =====
export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role: 'parent' | 'child' | 'admin';
  joinedAt: Date;
  lastActive: Date;
}

export async function createUserProfile(profile: Omit<UserProfile, 'joinedAt' | 'lastActive'>): Promise<void> {
  const profilesCollection = collection(db, 'userProfiles');
  await addDoc(profilesCollection, {
    ...profile,
    joinedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
}

export function listenToUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
  const profilesCollection = collection(db, 'userProfiles');
  const q = query(profilesCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const profile = snap.docs[0]?.data() as UserProfile | undefined;
    callback(profile || null);
  });
}

export function listenToAllUserProfiles(callback: (profiles: UserProfile[]) => void) {
  const profilesCollection = collection(db, 'userProfiles');
  const q = query(profilesCollection, orderBy('displayName', 'asc'));
  return onSnapshot(q, (snap) => {
    const profiles = snap.docs.map((d) => d.data() as UserProfile);
    callback(profiles);
  });
}

// ===== Family Management & Roles =====
export interface FamilyRole {
  userId: string;
  userName: string;
  role: 'admin' | 'parent' | 'child';
  permissions: {
    canManageBudget: boolean;
    canViewAll: boolean;
    canCreateEvents: boolean;
    canAssignTasks: boolean;
    canManageUsers: boolean;
  };
}

export async function assignFamilyRole(familyRole: FamilyRole): Promise<void> {
  const rolesCollection = collection(db, 'familyRoles');
  const q = query(rolesCollection, where('userId', '==', familyRole.userId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, familyRole as any);
  } else {
    await addDoc(rolesCollection, familyRole);
  }
}

export function listenToFamilyRoles(callback: (roles: FamilyRole[]) => void) {
  const rolesCollection = collection(db, 'familyRoles');
  const q = query(rolesCollection, orderBy('role', 'asc'));
  return onSnapshot(q, (snap) => {
    const roles = snap.docs.map((d) => d.data() as FamilyRole);
    callback(roles);
  });
}

export function listenToUserRole(userId: string, callback: (role: FamilyRole | null) => void) {
  const rolesCollection = collection(db, 'familyRoles');
  const q = query(rolesCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const role = snap.docs[0]?.data() as FamilyRole | undefined;
    callback(role || null);
  });
}

// ===== Activity Feed =====
export interface ActivityFeedItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export async function logActivityFeedItem(item: Omit<ActivityFeedItem, 'id'>): Promise<void> {
  const feedCollection = collection(db, 'activityFeed');
  await addDoc(feedCollection, {
    ...item,
    timestamp: serverTimestamp(),
  });
}

export function listenToActivityFeed(callback: (items: ActivityFeedItem[]) => void) {
  const feedCollection = collection(db, 'activityFeed');
  const q = query(feedCollection, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(),
      } as ActivityFeedItem;
    });
    callback(items);
  });
}

// ===== Data Export/Import =====
export async function exportUserData(userId: string): Promise<string> {
  const data: Record<string, any> = {
    exportDate: new Date().toISOString(),
    userId,
  };

  // Collect data from all collections
  const collections = ['familyChats', 'familyEvents', 'familyTasks', 'familyExpenses', 'userStats'];

  for (const collectionName of collections) {
    const q = query(collection(db, collectionName), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    data[collectionName] = snapshot.docs.map((d) => d.data());
  }

  return JSON.stringify(data, null, 2);
}

export async function downloadDataExport(userId: string, fileName = `jofamily-data-${userId}.json`): Promise<void> {
  const jsonData = await exportUserData(userId);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

// ===== Settings & Preferences =====
export interface AppSettings {
  userId: string;
  privacyLevel: 'public' | 'family' | 'private';
  allowLocationSharing: boolean;
  allowDataAnalytics: boolean;
  twoFactorEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const settingsCollection = collection(db, 'appSettings');
  const q = query(settingsCollection, where('userId', '==', settings.userId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, settings as any);
  } else {
    await addDoc(settingsCollection, settings);
  }
}

export function listenToAppSettings(userId: string, callback: (settings: AppSettings) => void) {
  const settingsCollection = collection(db, 'appSettings');
  const q = query(settingsCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const settings = snap.docs[0]?.data() as AppSettings;
    callback(
      settings || {
        userId,
        privacyLevel: 'family',
        allowLocationSharing: true,
        allowDataAnalytics: true,
        twoFactorEnabled: false,
        backupFrequency: 'weekly',
      }
    );
  });
}

// ===== PWA & Offline Support =====
export interface SyncedData {
  id: string;
  action: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data: Record<string, any>;
  timestamp: number;
  synced: boolean;
}

export async function queueOfflineSync(item: Omit<SyncedData, 'id' | 'timestamp' | 'synced'>): Promise<void> {
  const syncCollection = collection(db, 'offlineSync');
  await addDoc(syncCollection, {
    ...item,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getSyncQueue(): Promise<SyncedData[]> {
  const syncCollection = collection(db, 'offlineSync');
  const q = query(syncCollection, where('synced', '==', false));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as SyncedData
  );
}

export async function markAsSynced(syncId: string): Promise<void> {
  const syncRef = doc(db, 'offlineSync', syncId);
  await updateDoc(syncRef, { synced: true });
}

// ===== Accessibility =====
export interface AccessibilitySettings {
  userId: string;
  highContrast: boolean;
  fontSize: 'small' | 'normal' | 'large';
  screenReaderEnabled: boolean;
  reduceMotion: boolean;
  simplifiedUI: boolean;
}

export async function saveAccessibilitySettings(settings: AccessibilitySettings): Promise<void> {
  const accessibilityCollection = collection(db, 'accessibilitySettings');
  const q = query(accessibilityCollection, where('userId', '==', settings.userId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, settings as any);
  } else {
    await addDoc(accessibilityCollection, settings);
  }
}

export function listenToAccessibilitySettings(userId: string, callback: (settings: AccessibilitySettings) => void) {
  const accessibilityCollection = collection(db, 'accessibilitySettings');
  const q = query(accessibilityCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const settings = snap.docs[0]?.data() as AccessibilitySettings;
    callback(
      settings || {
        userId,
        highContrast: false,
        fontSize: 'normal',
        screenReaderEnabled: false,
        reduceMotion: false,
        simplifiedUI: false,
      }
    );
  });
}
