export type FeatureStatus = 'Done' | 'In Progress' | 'Planned' | 'Not Started';
export type FeaturePhase = 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 5' | 'Upcoming';

export type FeatureRecord = {
  key: string;
  name: string;
  description: string;
  status: FeatureStatus;
  phase: FeaturePhase;
  eta?: string;
  docs?: string;
};

export const features: FeatureRecord[] = [
  {
    key: 'chat',
    name: 'Real-Time Family Chat',
    description: 'Messaging hub for families with realtime updates and privacy-first defaults.',
    status: 'Done',
    phase: 'Phase 1',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#real-time-family-chat',
  },
  {
    key: 'calendar',
    name: 'Shared Family Calendar',
    description: 'Color-coded events, reminders, and conflict detection for the whole family.',
    status: 'Done',
    phase: 'Phase 1',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-2-shared-family-calendar',
  },
  {
    key: 'tasks',
    name: 'Family Task & Chore Management',
    description: 'Assign chores, track progress, and gamify completions with points and badges.',
    status: 'Done',
    phase: 'Phase 1',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-3-family-task--chore-management',
  },
  {
    key: 'budget',
    name: 'Family Budget & Expenses',
    description: 'Shared budgets, allowances, and expense tracking with simple insights.',
    status: 'Done',
    phase: 'Phase 1',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-4-family-budget--expenses',
  },
  {
    key: 'safety',
    name: 'Family Safety & Location',
    description: 'Opt-in location sharing, safe zones, and SOS alerts for peace of mind.',
    status: 'In Progress',
    phase: 'Phase 1',
    eta: 'Phase 1',
  },
  // Phase 3 highlights
  {
    key: 'phase3-search-edit',
    name: 'Message Search & Edit',
    description: 'Advanced chat controls with search, edit, read receipts, and typing indicators.',
    status: 'Done',
    phase: 'Phase 3',
    eta: 'Phase 3',
  },
  {
    key: 'phase3-ics-export',
    name: 'ICS Event Export & Sharing',
    description: 'Export events to ICS, share across calendars, and support timezones.',
    status: 'Done',
    phase: 'Phase 3',
    eta: 'Phase 3',
  },
  {
    key: 'phase3-split-expenses',
    name: 'Split & Recurring Expenses',
    description: 'Split expenses, set recurring payments, and trigger budget alerts.',
    status: 'Done',
    phase: 'Phase 3',
    eta: 'Phase 3',
  },
  {
    key: 'phase3-emergency-alerts',
    name: 'Emergency Alerts & Safe Routes',
    description: 'SOS flows, emergency contacts, location history, and safe-zone routing.',
    status: 'Done',
    phase: 'Phase 3',
    eta: 'Phase 3',
  },
  // Phase 4 highlights
  {
    key: 'phase4-video-chat',
    name: 'Video Chat & Threading',
    description: 'WebRTC video rooms with threaded messaging, bots, and community forums.',
    status: 'Done',
    phase: 'Phase 4',
    eta: 'Phase 4',
  },
  {
    key: 'phase4-smart-assistant',
    name: 'Smart Assistant & Predictive Alerts',
    description: 'AI-driven suggestions, predictive spending alerts, and behavior analytics.',
    status: 'Done',
    phase: 'Phase 4',
    eta: 'Phase 4',
  },
  {
    key: 'phase4-compliance',
    name: 'Compliance & Audit Trail',
    description: 'Audit logs, data retention, GDPR compliance, and enterprise org controls.',
    status: 'Done',
    phase: 'Phase 4',
    eta: 'Phase 4',
  },
  {
    key: 'phase4-payments',
    name: 'Subscriptions & Multi-Currency',
    description: 'Subscriptions, bill reminders, investments, tax planning, and multi-currency.',
    status: 'Done',
    phase: 'Phase 4',
    eta: 'Phase 4',
  },
  // Phase 5 roadmap
  {
    key: 'phase5-mobile',
    name: 'React Native Mobile Apps',
    description: 'iOS/Android apps with offline sync, biometrics, and native notifications.',
    status: 'Planned',
    phase: 'Phase 5',
    eta: 'Phase 5',
  },
  {
    key: 'phase5-desktop',
    name: 'Electron Desktop Apps',
    description: 'Windows/macOS/Linux desktop clients with system tray and auto-updates.',
    status: 'Planned',
    phase: 'Phase 5',
    eta: 'Phase 5',
  },
  {
    key: 'phase5-vertex-ai',
    name: 'Vertex AI Predictions',
    description: 'ML models for spending forecasts, task durations, and personalized insights.',
    status: 'Planned',
    phase: 'Phase 5',
    eta: 'Phase 5',
  },
  {
    key: 'phase5-global',
    name: 'Global Localization & Payments',
    description: '30+ languages, multi-region data, and localized payment methods.',
    status: 'Planned',
    phase: 'Phase 5',
    eta: 'Phase 5',
  },
  // Upcoming (next phase)
  {
    key: 'upcoming-ar-vr',
    name: 'AR/VR Memory Spaces',
    description: 'Immersive AR/VR family albums and virtual gathering spaces.',
    status: 'Not Started',
    phase: 'Upcoming',
    eta: 'Next Phase',
  },
  {
    key: 'upcoming-open-banking',
    name: 'Open Banking Sync',
    description: 'Bank account aggregation, real-time balances, and smart budgeting insights.',
    status: 'Not Started',
    phase: 'Upcoming',
    eta: 'Next Phase',
  },
  {
    key: 'upcoming-e2e',
    name: 'End-to-End Encryption v2',
    description: 'Zero-knowledge encryption for messaging, media, and sensitive records.',
    status: 'Not Started',
    phase: 'Upcoming',
    eta: 'Next Phase',
  },
];
