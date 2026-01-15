import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ===== Analytics & Insights =====

export interface DashboardMetrics {
  totalSpending: number;
  completedTasks: number;
  totalEvents: number;
  activeMembers: number;
  spendingTrend: number; // percentage change
  taskCompletionRate: number;
  familyEngagementScore: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const expensesSnap = await getDocs(collection(db, 'familyExpenses'));
  const tasksSnap = await getDocs(query(collection(db, 'familyTasks'), where('status', '==', 'completed')));
  const eventsSnap = await getDocs(collection(db, 'familyEvents'));
  const usersSnap = await getDocs(collection(db, 'userStats'));

  const totalSpending = expensesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  const completedTasks = tasksSnap.size;
  const totalEvents = eventsSnap.size;
  const activeMembers = new Set(usersSnap.docs.map((d) => d.id)).size;

  return {
    totalSpending,
    completedTasks,
    totalEvents,
    activeMembers,
    spendingTrend: 5.2, // placeholder
    taskCompletionRate: completedTasks > 0 ? (completedTasks / (tasksSnap.size + 1)) * 100 : 0,
    familyEngagementScore: Math.min(100, (activeMembers / 5) * 100),
  };
}

export interface SpendingTrend {
  month: string;
  amount: number;
  categoryBreakdown: Record<string, number>;
}

export async function getSpendingTrends(months = 6): Promise<SpendingTrend[]> {
  const trends: SpendingTrend[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthExpenses = await getDocs(
      query(
        collection(db, 'familyExpenses'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      )
    );

    const categoryBreakdown: Record<string, number> = {};
    let monthTotal = 0;

    monthExpenses.docs.forEach((doc) => {
      const data = doc.data();
      const category = data.category || 'other';
      const amount = data.amount || 0;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
      monthTotal += amount;
    });

    trends.push({
      month: startDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
      amount: monthTotal,
      categoryBreakdown,
    });
  }

  return trends;
}

export interface TimeAnalytics {
  totalHoursSpent: number;
  peakHours: string[];
  tasksPerHour: Record<string, number>;
  productivityScore: number;
}

export async function getTimeAnalytics(): Promise<TimeAnalytics> {
  const tasksSnap = await getDocs(query(collection(db, 'familyTasks'), where('status', '==', 'completed')));
  const tasksPerHour: Record<string, number> = {};

  let totalHours = 0;
  tasksSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.completedAt) {
      const hour = new Date(data.completedAt).getHours().toString().padStart(2, '0');
      tasksPerHour[hour] = (tasksPerHour[hour] || 0) + 1;
      totalHours++;
    }
  });

  const peakHours = Object.entries(tasksPerHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => hour);

  return {
    totalHoursSpent: totalHours,
    peakHours,
    tasksPerHour,
    productivityScore: Math.min(100, (totalHours / 100) * 100),
  };
}

export async function logAnalyticsData(data: Record<string, any>): Promise<void> {
  const analyticsCollection = collection(db, 'analyticsData');
  await addDoc(analyticsCollection, {
    ...data,
    timestamp: serverTimestamp(),
  });
}

// ===== Video Calling (WebRTC) =====

export interface VideoCall {
  id: string;
  initiatorId: string;
  participantIds: string[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordingUrl?: string;
  status: 'pending' | 'active' | 'ended';
}

export async function initializeVideoCall(initiatorId: string, participantIds: string[]): Promise<string> {
  const callsCollection = collection(db, 'videoCalls');
  const ref = await addDoc(callsCollection, {
    initiatorId,
    participantIds,
    startTime: serverTimestamp(),
    status: 'pending',
    recordingUrl: null,
  });
  return ref.id;
}

export async function updateCallStatus(callId: string, status: string, data?: Record<string, any>): Promise<void> {
  const callRef = doc(db, 'videoCalls', callId);
  await updateDoc(callRef, {
    status,
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function endVideoCall(callId: string, recordingUrl?: string): Promise<void> {
  const callRef = doc(db, 'videoCalls', callId);
  await updateDoc(callRef, {
    status: 'ended',
    endTime: serverTimestamp(),
    recordingUrl: recordingUrl || null,
  });
}

// ===== Family Governance =====

export interface ParentalControl {
  userId: string;
  appRestrictions: string[];
  screenTimeLimit: number; // minutes per day
  contentFilter: boolean;
  bedtimeMode: { enabled: boolean; startTime: string; endTime: string };
  allowedApps: string[];
  blockedApps: string[];
}

export async function setParentalControl(control: ParentalControl): Promise<void> {
  const controlsCollection = collection(db, 'parentalControls');
  const q = query(controlsCollection, where('userId', '==', control.userId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, control as any);
  } else {
    await addDoc(controlsCollection, control);
  }
}

export function listenToParentalControls(userId: string, callback: (control: ParentalControl | null) => void) {
  const controlsCollection = collection(db, 'parentalControls');
  const q = query(controlsCollection, where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    const control = snap.docs[0]?.data() as ParentalControl | undefined;
    callback(control || null);
  });
}

export interface ScreenTimeSession {
  userId: string;
  date: Date;
  appName: string;
  duration: number; // seconds
}

export async function logScreenTimeSession(session: Omit<ScreenTimeSession, 'date'>): Promise<void> {
  const screenTimeCollection = collection(db, 'screenTimeSessions');
  await addDoc(screenTimeCollection, {
    ...session,
    date: serverTimestamp(),
  });
}

// ===== Advanced Safety =====

export interface RealTimeLocation {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  heading: number;
  timestamp: Date;
}

export async function trackRealTimeLocation(location: Omit<RealTimeLocation, 'timestamp'>): Promise<void> {
  const rtLocCollection = collection(db, 'realTimeLocations');
  await addDoc(rtLocCollection, {
    ...location,
    timestamp: serverTimestamp(),
  });
}

export function listenToRealTimeLocations(callback: (locations: RealTimeLocation[]) => void) {
  const rtLocCollection = collection(db, 'realTimeLocations');
  const q = query(rtLocCollection, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const locations = snap.docs.map((d) => d.data() as RealTimeLocation);
    callback(locations);
  });
}

export async function createThreatAlert(threat: {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  userId: string;
}): Promise<void> {
  const threatCollection = collection(db, 'threatAlerts');
  await addDoc(threatCollection, {
    ...threat,
    status: 'active',
    createdAt: serverTimestamp(),
  });
}

// ===== Social & Sharing =====

export interface FamilyPhotoAlbum {
  id: string;
  name: string;
  photos: Array<{ url: string; uploadedBy: string; timestamp: Date }>;
  createdAt: Date;
  permissions: string[]; // user IDs
}

export async function createPhotoAlbum(name: string, permissions: string[]): Promise<string> {
  const albumsCollection = collection(db, 'familyPhotoAlbums');
  const ref = await addDoc(albumsCollection, {
    name,
    photos: [],
    permissions,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function addPhotoToAlbum(albumId: string, _photoUrl: string, _uploadedBy: string): Promise<void> {
  const albumRef = doc(db, 'familyPhotoAlbums', albumId);
  await updateDoc(albumRef, {
    photos: (await getDocs(collection(db, 'familyPhotoAlbums'))).docs
      .find((d) => d.id === albumId)
      ?.data().photos || [],
  });
}

// ===== Smart Integrations =====

export interface CalendarSync {
  userId: string;
  provider: 'google' | 'apple' | 'microsoft';
  accessToken: string;
  syncEnabled: boolean;
  lastSync: Date;
}

export async function setupCalendarSync(sync: Omit<CalendarSync, 'lastSync'>): Promise<void> {
  const syncCollection = collection(db, 'calendarSync');
  const q = query(syncCollection, where('userId', '==', sync.userId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, sync as any);
  } else {
    await addDoc(syncCollection, { ...sync, lastSync: serverTimestamp() });
  }
}

export interface StreamingIntegration {
  userId: string;
  platform: 'spotify' | 'netflix' | 'disney+';
  accessToken: string;
  syncEnabled: boolean;
}

export async function setupStreamingIntegration(integration: StreamingIntegration): Promise<void> {
  const streamCollection = collection(db, 'streamingIntegrations');
  const q = query(streamCollection, where('userId', '==', integration.userId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, integration as any);
  } else {
    await addDoc(streamCollection, integration);
  }
}

// ===== Advanced Payments =====

export interface CryptoTransaction {
  id: string;
  userId: string;
  currency: 'BTC' | 'ETH' | 'USDC';
  amount: number;
  usdValue: number;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export async function recordCryptoTransaction(tx: Omit<CryptoTransaction, 'id' | 'timestamp'>): Promise<string> {
  const cryptoCollection = collection(db, 'cryptoTransactions');
  const ref = await addDoc(cryptoCollection, {
    ...tx,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

export interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextPaymentDate: Date;
  isActive: boolean;
}

export async function createPaymentSchedule(schedule: Omit<PaymentSchedule, 'id'>): Promise<string> {
  const scheduleCollection = collection(db, 'paymentSchedules');
  const ref = await addDoc(scheduleCollection, {
    ...schedule,
    nextPaymentDate: new Date(schedule.nextPaymentDate),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ===== AI & Automation =====

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  condition: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export async function createAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): Promise<string> {
  const rulesCollection = collection(db, 'automationRules');
  const ref = await addDoc(rulesCollection, {
    ...rule,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function executeAutomationRule(ruleId: string, context: Record<string, any>): Promise<void> {
  const executionCollection = collection(db, 'automationExecutions');
  await addDoc(executionCollection, {
    ruleId,
    context,
    executedAt: serverTimestamp(),
    status: 'completed',
  });
}

// ===== Enterprise Features =====

export interface EnterpriseOrganization {
  id: string;
  name: string;
  families: string[];
  adminUsers: string[];
  createdAt: Date;
  ssoEnabled: boolean;
  apiKeysCount: number;
}

export async function createEnterpriseOrg(org: Omit<EnterpriseOrganization, 'id' | 'createdAt'>): Promise<string> {
  const orgCollection = collection(db, 'enterpriseOrganizations');
  const ref = await addDoc(orgCollection, {
    ...org,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export async function logAuditEvent(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const auditCollection = collection(db, 'auditLogs');
  await addDoc(auditCollection, {
    ...log,
    timestamp: serverTimestamp(),
  });
}

export async function getAuditLogs(userId?: string, days = 30): Promise<AuditLog[]> {
  const auditCollection = collection(db, 'auditLogs');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = userId
    ? query(
        auditCollection,
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      )
    : query(
        auditCollection,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AuditLog);
}

export interface APIKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export async function generateAPIKey(
  organizationId: string,
  name: string,
  permissions: string[]
): Promise<APIKey> {
  const apiKeyCollection = collection(db, 'apiKeys');
  const key = `jof_${Math.random().toString(36).substring(2, 15)}`;
  const secret = Math.random().toString(36).substring(2, 15);

  const ref = await addDoc(apiKeyCollection, {
    organizationId,
    name,
    key,
    secret,
    permissions,
    createdAt: serverTimestamp(),
    isActive: true,
  });

  return {
    id: ref.id,
    organizationId,
    name,
    key,
    secret,
    permissions,
    createdAt: new Date(),
    isActive: true,
  };
}

  // ===== Advanced Communication =====
  export interface MessageThread {
    id: string;
    title: string;
    participants: string[];
    messages: number;
    lastMessage: string;
    createdAt: Date;
    isPinned: boolean;
  }

  export async function createThreadGroup(title: string, participants: string[]): Promise<string> {
    const ref = await addDoc(collection(db, 'messageThreads'), {
      title,
      participants,
      messages: 0,
      lastMessage: '',
      createdAt: serverTimestamp(),
      isPinned: false,
      archived: false,
    });
    return ref.id;
  }

  export async function sendThreadMessage(threadId: string, senderId: string, content: string, attachments?: string[]): Promise<void> {
    const threadRef = doc(db, 'messageThreads', threadId);
    await updateDoc(threadRef, {
      lastMessage: content.substring(0, 50),
    });

    await addDoc(collection(db, `messageThreads/${threadId}/messages`), {
      senderId,
      content,
      attachments: attachments || [],
      reactions: [],
      timestamp: serverTimestamp(),
      edited: false,
    });
  }

  export async function setupVideoChat(channelId: string, participants: string[]): Promise<{ sessionId: string; signalingUrl: string }> {
    const ref = await addDoc(collection(db, 'videoChatSessions'), {
      channelId,
      participants,
      startTime: serverTimestamp(),
      recordingEnabled: false,
      status: 'active',
    });

    return {
      sessionId: ref.id,
      signalingUrl: `wss://signaling.jofamily.com/${ref.id}`,
    };
  }

  export async function recordChatHistory(threadId: string): Promise<void> {
    const threadRef = doc(db, 'messageThreads', threadId);
    await updateDoc(threadRef, {
      archived: true,
      archivedAt: serverTimestamp(),
    });
  }

  export async function setupChatBots(familyId: string, botType: 'assistant' | 'reminder' | 'translator'): Promise<void> {
    await addDoc(collection(db, 'chatBots'), {
      familyId,
      type: botType,
      enabled: true,
      settings: {},
      createdAt: serverTimestamp(),
    });
  }

  export async function managePushNotificationPreferences(userId: string, preferences: Record<string, boolean>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationPreferences: preferences,
    });
  }

  export async function createCommunityForum(familyId: string, forumName: string, moderators: string[]): Promise<string> {
    const ref = await addDoc(collection(db, 'communityForums'), {
      familyId,
      name: forumName,
      moderators,
      members: moderators,
      createdAt: serverTimestamp(),
      postCount: 0,
    });
    return ref.id;
  }

  // ===== Multi-Platform Support =====
  export interface MobileAppSettings {
    userId: string;
    deviceType: 'ios' | 'android';
    appVersion: string;
    allowOfflineMode: boolean;
    syncFrequency: number;
  }

  export async function setupMobileAppSync(settings: MobileAppSettings): Promise<void> {
    await addDoc(collection(db, 'mobileAppSync'), {
      ...settings,
      lastSync: serverTimestamp(),
      isOnline: true,
    });
  }

  export async function enableOfflineModeSupport(deviceId: string): Promise<void> {
    await addDoc(collection(db, 'offlineDevices'), {
      deviceId,
      enabled: true,
      lastSyncTime: serverTimestamp(),
      queuedActions: [],
    });
  }

  export async function setupDesktopApp(userId: string, platform: 'windows' | 'mac' | 'linux'): Promise<void> {
    await addDoc(collection(db, 'desktopInstances'), {
      userId,
      platform,
      version: '1.0.0',
      installedAt: serverTimestamp(),
      autoUpdates: true,
    });
  }

  export async function createWebPlatformPresets(familyId: string): Promise<void> {
    await addDoc(collection(db, 'webPresets'), {
      familyId,
      layout: 'default',
      theme: 'light',
      sidebarPosition: 'left',
      createdAt: serverTimestamp(),
    });
  }

  export async function enableWearableIntegration(userId: string, wearableType: string, deviceId: string): Promise<void> {
    await addDoc(collection(db, 'wearables'), {
      userId,
      type: wearableType,
      deviceId,
      syncEnabled: true,
      lastSync: serverTimestamp(),
      metrics: ['steps', 'heart_rate', 'sleep'],
    });
  }

  // ===== Advanced Safety & Monitoring =====
  export interface HealthAlert {
    userId: string;
    type: 'emergency' | 'warning' | 'info';
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    createdAt: Date;
  }

  export async function setupHealthMonitoring(userId: string): Promise<void> {
    await addDoc(collection(db, 'healthMonitoring'), {
      userId,
      enabled: true,
      metrics: ['heart_rate', 'sleep', 'steps', 'blood_pressure'],
      alerts: [],
      createdAt: serverTimestamp(),
    });
  }

  export async function createHealthAlert(_userId: string, alert: Omit<HealthAlert, 'createdAt'>): Promise<void> {
    await addDoc(collection(db, 'healthAlerts'), {
      ...alert,
      acknowledged: false,
      createdAt: serverTimestamp(),
    });
  }

  export async function monitorMentalWellbeing(familyId: string): Promise<void> {
    await addDoc(collection(db, 'wellnessScores'), {
      familyId,
      checkinDate: serverTimestamp(),
      memberScores: {},
      overallScore: 0,
    });
  }

  export async function setupIncidentTracking(familyId: string): Promise<void> {
    await addDoc(collection(db, 'incidentReports'), {
      familyId,
      incidents: [],
      createdAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
    });
  }

  export async function recordWellnessCheckIns(userId: string, mood: string, notes: string): Promise<void> {
    await addDoc(collection(db, 'wellnessCheckins'), {
      userId,
      mood,
      notes,
      timestamp: serverTimestamp(),
    });
  }

  export async function setupSafetyDrills(familyId: string, drillType: string): Promise<void> {
    await addDoc(collection(db, 'safetyDrills'), {
      familyId,
      type: drillType,
      scheduledDate: serverTimestamp(),
      participants: [],
      status: 'scheduled',
    });
  }

  export async function trackEmergencyContactUpdates(familyId: string): Promise<void> {
    await addDoc(collection(db, 'emergencyContacts'), {
      familyId,
      lastUpdated: serverTimestamp(),
      contacts: [],
      verified: false,
    });
  }

  // ===== Social & Sharing Enhancements =====
  export interface FamilyMemory {
    id: string;
    familyId: string;
    content: string;
    tags: string[];
    contributors: string[];
    createdAt: Date;
    likeCount: number;
    commentCount: number;
  }

  export async function createFamilyMemory(familyId: string, content: string, tags: string[], createdBy: string): Promise<string> {
    const ref = await addDoc(collection(db, 'familyMemories'), {
      familyId,
      content,
      tags,
      contributors: [createdBy],
      createdAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      archived: false,
    });
    return ref.id;
  }

  export async function createStoryArchive(familyId: string, storyTitle: string): Promise<string> {
    const ref = await addDoc(collection(db, 'storyArchives'), {
      familyId,
      title: storyTitle,
      stories: [],
      createdAt: serverTimestamp(),
      viewCount: 0,
    });
    return ref.id;
  }

  export async function createMemoryTimeline(familyId: string): Promise<void> {
    await addDoc(collection(db, 'memoryTimelines'), {
      familyId,
      events: [],
      createdAt: serverTimestamp(),
      yearsSpanned: 0,
    });
  }

  export async function setupPhotoOrganization(familyId: string): Promise<void> {
    await addDoc(collection(db, 'photoCollections'), {
      familyId,
      collections: [],
      totalPhotos: 0,
      storageUsed: 0,
      createdAt: serverTimestamp(),
    });
  }

  export async function enableVideoSharingGallery(familyId: string): Promise<void> {
    await addDoc(collection(db, 'videoGalleries'), {
      familyId,
      videos: [],
      totalDuration: 0,
      createdAt: serverTimestamp(),
      isPublic: false,
    });
  }

  export async function createGuestAccessLinks(familyId: string, expiresIn: number): Promise<string> {
    const ref = await addDoc(collection(db, 'guestLinks'), {
      familyId,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + expiresIn),
      accessLevel: 'view',
      usageCount: 0,
    });
    return ref.id;
  }

  // ===== Smart Integrations Expansion =====
  export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    forecast: string[];
  }

  export async function setupWeatherAlerts(familyId: string, locations: string[]): Promise<void> {
    await addDoc(collection(db, 'weatherAlerts'), {
      familyId,
      locations,
      enabled: true,
      alertTypes: ['severe', 'warning'],
      createdAt: serverTimestamp(),
    });
  }

  export async function setupSmartHomeIntegration(familyId: string, homeType: 'alexa' | 'google' | 'apple'): Promise<void> {
    await addDoc(collection(db, 'smartHomeDevices'), {
      familyId,
      type: homeType,
      devices: [],
      authorizedUsers: [],
      createdAt: serverTimestamp(),
    });
  }

  export async function setupGroceryListSync(familyId: string, retailer?: string): Promise<void> {
    await addDoc(collection(db, 'grocerySync'), {
      familyId,
      retailer: retailer || 'generic',
      items: [],
      lastSync: serverTimestamp(),
      autoSync: true,
    });
  }

  export async function setupPublicTransitTracking(familyId: string): Promise<void> {
    await addDoc(collection(db, 'transitTracking'), {
      familyId,
      members: {},
      routes: [],
      createdAt: serverTimestamp(),
    });
  }

  export async function setupNewsAggregation(familyId: string, topics: string[]): Promise<void> {
    await addDoc(collection(db, 'newsAggregation'), {
      familyId,
      topics,
      enabled: true,
      updateFrequency: 'daily',
      createdAt: serverTimestamp(),
    });
  }

  // ===== Advanced Payments Expansion =====
  export interface RecurringPayment {
    id: string;
    familyId: string;
    fromMember: string;
    toMember: string;
    amount: number;
    currency: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    startDate: Date;
    endDate?: Date;
    autoExecute: boolean;
    reason: string;
  }

  export async function setupSubscriptionTracking(familyId: string): Promise<void> {
    await addDoc(collection(db, 'subscriptions'), {
      familyId,
      services: [],
      totalMonthlyCost: 0,
      createdAt: serverTimestamp(),
      duplicationDetected: false,
    });
  }

  export async function setupBillReminders(familyId: string): Promise<void> {
    await addDoc(collection(db, 'billReminders'), {
      familyId,
      bills: [],
      reminderDaysBefore: 3,
      createdAt: serverTimestamp(),
    });
  }

  export async function enableMultiCurrencySupport(familyId: string): Promise<void> {
    await addDoc(collection(db, 'multiCurrency'), {
      familyId,
      currencies: ['USD'],
      exchangeRates: {},
      updatedAt: serverTimestamp(),
    });
  }

  export async function setupPaymentSchedulingAdvanced(payment: Omit<RecurringPayment, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'advancedPayments'), {
      ...payment,
      createdAt: serverTimestamp(),
      nextDueDate: payment.startDate,
      status: 'active',
    });
    return ref.id;
  }

  export async function setupInvestmentTracking(familyId: string): Promise<void> {
    await addDoc(collection(db, 'investments'), {
      familyId,
      portfolios: [],
      totalValue: 0,
      createdAt: serverTimestamp(),
    });
  }

  export async function setupTaxPlanning(familyId: string): Promise<void> {
    await addDoc(collection(db, 'taxPlanning'), {
      familyId,
      year: new Date().getFullYear(),
      documents: [],
      estimatedTaxes: {},
      createdAt: serverTimestamp(),
    });
  }

  // ===== AI & Automation Expansion =====
  export interface SmartSuggestion {
    type: 'task' | 'expense' | 'event' | 'allocation';
    suggestion: string;
    confidence: number;
    basedOn: string[];
  }

  export async function setupSmartAssistant(familyId: string): Promise<void> {
    await addDoc(collection(db, 'smartAssistants'), {
      familyId,
      enabled: true,
      suggestions: [],
      learningProfile: {},
      createdAt: serverTimestamp(),
    });
  }

  export async function generateAIInsights(familyId: string): Promise<SmartSuggestion[]> {
    const expensesSnap = await getDocs(
      query(collection(db, 'familyExpenses'), where('familyId', '==', familyId), orderBy('createdAt', 'desc'))
    );

    const suggestions: SmartSuggestion[] = [];
    const expenses = expensesSnap.docs.map((d) => d.data());

    if (expenses.length > 10) {
      const avgAmount = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0) / expenses.length;
      suggestions.push({
        type: 'expense',
        suggestion: `Average spending is $${avgAmount.toFixed(2)}`,
        confidence: 0.95,
        basedOn: ['spending_history'],
      });
    }

    return suggestions;
  }

  export async function setupPredictiveAlerts(familyId: string): Promise<void> {
    await addDoc(collection(db, 'predictiveAlerts'), {
      familyId,
      alerts: [],
      enabled: true,
      predictiveModel: 'v1',
      createdAt: serverTimestamp(),
    });
  }

  export async function enablePersonalizedRecommendations(userId: string): Promise<void> {
    await addDoc(collection(db, 'recommendations'), {
      userId,
      items: [],
      enabled: true,
      personalizationLevel: 'medium',
      createdAt: serverTimestamp(),
    });
  }

  export async function setupBehaviorAnalytics(familyId: string): Promise<void> {
    await addDoc(collection(db, 'behaviorAnalytics'), {
      familyId,
      patterns: [],
      insights: [],
      createdAt: serverTimestamp(),
    });
  }

  // ===== Compliance & Governance =====
  export interface ComplianceDocument {
    id: string;
    type: 'privacy' | 'terms' | 'consent' | 'policy';
    version: string;
    content: string;
    effectiveDate: Date;
    acceptedBy: string[];
  }

  export async function setupComplianceTracking(familyId: string): Promise<void> {
    await addDoc(collection(db, 'compliance'), {
      familyId,
      policies: [],
      lastAudit: serverTimestamp(),
      certifications: [],
    });
  }

  export async function manageDataRetention(familyId: string, retentionDays: number): Promise<void> {
    await addDoc(collection(db, 'dataRetention'), {
      familyId,
      retentionDays,
      autoDeleteEnabled: true,
      createdAt: serverTimestamp(),
    });
  }

  export async function setupGDPRCompliance(familyId: string): Promise<void> {
    await addDoc(collection(db, 'gdprCompliance'), {
      familyId,
      consent: {},
      dataProcessing: {},
      createdAt: serverTimestamp(),
    });
  }
