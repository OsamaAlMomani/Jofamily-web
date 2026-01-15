import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase/firebase';
import type {
  UserLocation,
  SafeZone,
  SOSAlert,
  ZoneEvent,
  UpdateLocationSharingInput,
  CreateSafeZoneInput,
  CreateSOSAlertInput,
  ResolveSOSAlertInput,
} from '../types/safety';

const LOCATION_COLLECTION = 'familyLocations';
const SAFEZONE_COLLECTION = 'familySafeZones';
const SOS_COLLECTION = 'familySOS';
const ZONE_EVENTS_COLLECTION = 'familyZoneEvents';

/**
 * Listen to all user locations with active sharing
 */
export function listenToUserLocations(callback: (locations: UserLocation[]) => void) {
  const q = query(
    collection(db, LOCATION_COLLECTION),
    where('sharingStatus', '==', 'enabled'),
    orderBy('lastUpdated', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const locations: UserLocation[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
        sharingStatus: data.sharingStatus,
        lastUpdated: data.lastUpdated,
      };
    });
    callback(locations);
  });
}

/**
 * Update or create user location
 */
export async function updateUserLocation(input: UpdateLocationSharingInput): Promise<void> {
  const q = query(collection(db, LOCATION_COLLECTION), where('userId', '==', input.userId));
  const snapshot = await new Promise<any>((resolve) => {
    const unsub = onSnapshot(q, (snap) => {
      unsub();
      resolve(snap);
    });
  });

  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      sharingStatus: input.sharingStatus,
      timestamp: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, LOCATION_COLLECTION), {
      userId: input.userId,
      userName: input.userName,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      sharingStatus: input.sharingStatus,
      timestamp: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  }
}

/**
 * Listen to all safe zones
 */
export function listenToSafeZones(callback: (zones: SafeZone[]) => void) {
  const q = query(collection(db, SAFEZONE_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const zones: SafeZone[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        notifyOnEntry: data.notifyOnEntry,
        notifyOnExit: data.notifyOnExit,
        color: data.color,
      };
    });
    callback(zones);
  });
}

/**
 * Create a new safe zone
 */
export async function createSafeZone(input: CreateSafeZoneInput): Promise<void> {
  await addDoc(collection(db, SAFEZONE_COLLECTION), {
    name: input.name,
    description: input.description ?? '',
    latitude: input.latitude,
    longitude: input.longitude,
    radius: input.radius,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    notifyOnEntry: input.notifyOnEntry,
    notifyOnExit: input.notifyOnExit,
    color: input.color,
  });
}

/**
 * Listen to active SOS alerts
 */
export function listenToSOSAlerts(callback: (alerts: SOSAlert[]) => void) {
  const q = query(collection(db, SOS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const alerts: SOSAlert[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        latitude: data.latitude,
        longitude: data.longitude,
        message: data.message,
        timestamp: data.timestamp,
        status: data.status,
        resolvedAt: data.resolvedAt,
        resolvedBy: data.resolvedBy,
      };
    });
    callback(alerts);
  });
}

/**
 * Create a new SOS alert
 */
export async function createSOSAlert(input: CreateSOSAlertInput): Promise<void> {
  await addDoc(collection(db, SOS_COLLECTION), {
    userId: input.userId,
    userName: input.userName,
    latitude: input.latitude,
    longitude: input.longitude,
    message: input.message ?? '',
    timestamp: serverTimestamp(),
    status: 'active',
  });
}

/**
 * Resolve an SOS alert
 */
export async function resolveSOSAlert(input: ResolveSOSAlertInput): Promise<void> {
  const docRef = doc(db, SOS_COLLECTION, input.alertId);
  await updateDoc(docRef, {
    status: input.status,
    resolvedAt: serverTimestamp(),
    resolvedBy: input.resolvedBy,
  });
}

/**
 * Listen to zone events
 */
export function listenToZoneEvents(callback: (events: ZoneEvent[]) => void) {
  const q = query(collection(db, ZONE_EVENTS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const events: ZoneEvent[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        zoneId: data.zoneId,
        zoneName: data.zoneName,
        eventType: data.eventType,
        timestamp: data.timestamp,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    });
    callback(events);
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
