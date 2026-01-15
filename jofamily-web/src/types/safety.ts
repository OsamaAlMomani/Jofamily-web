import type { Timestamp } from 'firebase/firestore';

/**
 * Location sharing permission status
 */
export type LocationSharingStatus = 'enabled' | 'disabled' | 'paused';

/**
 * User's location data
 */
export type UserLocation = {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Timestamp;
  sharingStatus: LocationSharingStatus;
  lastUpdated: Timestamp;
};

/**
 * Safe zone (geofence) definition
 */
export type SafeZone = {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  createdBy: string;
  createdAt: Timestamp;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  color: string;
};

/**
 * SOS alert
 */
export type SOSAlert = {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  message?: string;
  timestamp: Timestamp;
  status: 'active' | 'resolved' | 'false-alarm';
  resolvedAt?: Timestamp;
  resolvedBy?: string;
};

/**
 * Zone event (entry/exit notification)
 */
export type ZoneEvent = {
  id: string;
  userId: string;
  userName: string;
  zoneId: string;
  zoneName: string;
  eventType: 'entry' | 'exit';
  timestamp: Timestamp;
  latitude: number;
  longitude: number;
};

/**
 * Input type for updating location sharing
 */
export type UpdateLocationSharingInput = {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  sharingStatus: LocationSharingStatus;
};

/**
 * Input type for creating a safe zone
 */
export type CreateSafeZoneInput = {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdBy: string;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  color: string;
};

/**
 * Input type for creating an SOS alert
 */
export type CreateSOSAlertInput = {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  message?: string;
};

/**
 * Input type for resolving an SOS alert
 */
export type ResolveSOSAlertInput = {
  alertId: string;
  status: 'resolved' | 'false-alarm';
  resolvedBy: string;
};
