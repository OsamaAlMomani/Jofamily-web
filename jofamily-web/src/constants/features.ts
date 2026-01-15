export type FeatureStatus = 'Done' | 'In Progress' | 'Planned' | 'Not Started';

export type FeatureRecord = {
  key: string;
  name: string;
  description: string;
  status: FeatureStatus;
  eta?: string;
  docs?: string;
};

export const features: FeatureRecord[] = [
  {
    key: 'chat',
    name: 'Real-Time Family Chat',
    description: 'Messaging hub for families with realtime updates and privacy-first defaults.',
    status: 'Done',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#real-time-family-chat',
  },
  {
    key: 'calendar',
    name: 'Shared Family Calendar',
    description: 'Color-coded events, reminders, and conflict detection for the whole family.',
    status: 'Done',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-2-shared-family-calendar',
  },
  {
    key: 'tasks',
    name: 'Family Task & Chore Management',
    description: 'Assign chores, track progress, and gamify completions with points and badges.',
    status: 'Done',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-3-family-task--chore-management',
  },
  {
    key: 'budget',
    name: 'Family Budget & Expenses',
    description: 'Shared budgets, allowances, and expense tracking with simple insights.',
    status: 'Done',
    eta: 'Phase 1',
    docs: '/docs/FEATURE_PROGRESS.md#feature-4-family-budget--expenses',
  },
  {
    key: 'safety',
    name: 'Family Safety & Location',
    description: 'Opt-in location sharing, safe zones, and SOS alerts for peace of mind.',
    status: 'In Progress',
    eta: 'Phase 1',
  },
];
