import { useEffect, useState } from 'react';
import './Safety.css';
import { useAuth } from '../../core';
import {
  createSafeZone,
  createSOSAlert,
  listenToSafeZones,
  listenToSOSAlerts,
  listenToUserLocations,
  listenToZoneEvents,
  resolveSOSAlert,
  updateUserLocation,
} from '../../services';
import type {
  CreateSafeZoneInput,
  CreateSOSAlertInput,
  ResolveSOSAlertInput,
  SafeZone,
  SOSAlert,
  UpdateLocationSharingInput,
  UserLocation,
  ZoneEvent,
} from '../../types/safety';

export default function Safety() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [zoneEvents, setZoneEvents] = useState<ZoneEvent[]>([]);

  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [currentLat, setCurrentLat] = useState('');
  const [currentLon, setCurrentLon] = useState('');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Safe zone form
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [zoneLat, setZoneLat] = useState('');
  const [zoneLon, setZoneLon] = useState('');
  const [zoneRadius, setZoneRadius] = useState('100');
  const [notifyEntry, setNotifyEntry] = useState(true);
  const [notifyExit, setNotifyExit] = useState(true);
  const [zoneColor, setZoneColor] = useState('#22c55e');
  const [creatingZone, setCreatingZone] = useState(false);

  // SOS form
  const [sosMessage, setSosMessage] = useState('');
  const [creatingSos, setCreatingSos] = useState(false);

  const [view, setView] = useState<'map' | 'zones' | 'sos' | 'events'>('map');

  useEffect(() => {
    const unsub = listenToUserLocations(setLocations);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToSafeZones(setSafeZones);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToSOSAlerts(setSosAlerts);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToZoneEvents(setZoneEvents);
    return () => unsub();
  }, []);

  function toggleLocationSharing() {
    if (!user) return;

    if (sharingEnabled) {
      // Stop sharing
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setSharingEnabled(false);
      const input: UpdateLocationSharingInput = {
        userId: user.uid,
        userName: user.email ?? 'User',
        latitude: parseFloat(currentLat) || 0,
        longitude: parseFloat(currentLon) || 0,
        accuracy: 0,
        sharingStatus: 'disabled',
      };
      updateUserLocation(input);
    } else {
      // Start sharing
      if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const acc = position.coords.accuracy;
            setCurrentLat(lat.toFixed(6));
            setCurrentLon(lon.toFixed(6));
            const input: UpdateLocationSharingInput = {
              userId: user.uid,
              userName: user.email ?? 'User',
              latitude: lat,
              longitude: lon,
              accuracy: acc,
              sharingStatus: 'enabled',
            };
            updateUserLocation(input);
          },
          (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to access location. Please check permissions.');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        setWatchId(id);
        setSharingEnabled(true);
      } else {
        alert('Geolocation not supported by your browser.');
      }
    }
  }

  async function handleCreateZone(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !zoneName.trim() || !zoneLat || !zoneLon || !zoneRadius) return;
    setCreatingZone(true);
    try {
      const input: CreateSafeZoneInput = {
        name: zoneName.trim(),
        description: zoneDesc.trim(),
        latitude: parseFloat(zoneLat),
        longitude: parseFloat(zoneLon),
        radius: parseFloat(zoneRadius),
        createdBy: user.uid,
        notifyOnEntry: notifyEntry,
        notifyOnExit: notifyExit,
        color: zoneColor,
      };
      await createSafeZone(input);
      setZoneName('');
      setZoneDesc('');
      setZoneLat('');
      setZoneLon('');
      setZoneRadius('100');
      setNotifyEntry(true);
      setNotifyExit(true);
      setZoneColor('#22c55e');
    } finally {
      setCreatingZone(false);
    }
  }

  async function handleCreateSOS(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !currentLat || !currentLon) {
      alert('Please enable location sharing first.');
      return;
    }
    setCreatingSos(true);
    try {
      const input: CreateSOSAlertInput = {
        userId: user.uid,
        userName: user.email ?? 'User',
        latitude: parseFloat(currentLat),
        longitude: parseFloat(currentLon),
        message: sosMessage.trim(),
      };
      await createSOSAlert(input);
      setSosMessage('');
    } finally {
      setCreatingSos(false);
    }
  }

  async function handleResolveAlert(alertId: string, status: 'resolved' | 'false-alarm') {
    if (!user) return;
    const input: ResolveSOSAlertInput = {
      alertId,
      status,
      resolvedBy: user.uid,
    };
    await resolveSOSAlert(input);
  }

  const activeAlerts = sosAlerts.filter((a) => a.status === 'active');

  if (!user) {
    return (
      <div className="safety-page">
        <header className="safety-hero">
          <div className="safety-hero__content">
            <p className="eyebrow">Feature 5 · Sign in required</p>
            <h1>Family Safety & Location</h1>
            <p className="lede">Sign in to share your location and create safe zones.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="safety-page">
      <header className="safety-hero">
        <div className="safety-hero__content">
          <p className="eyebrow">Feature 5 · In Progress</p>
          <h1>Family Safety & Location</h1>
          <p className="lede">Opt-in location sharing, safe zones, and SOS alerts for peace of mind.</p>

          <div className="insights-row">
            <div className="insight-card">
              <div className="insight-value">{locations.length}</div>
              <div className="insight-label">Active Locations</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{safeZones.length}</div>
              <div className="insight-label">Safe Zones</div>
            </div>
            <div className="insight-card">
              <div className="insight-value">{activeAlerts.length}</div>
              <div className="insight-label">Active SOS</div>
            </div>
          </div>
        </div>
      </header>

      <section className="safety-layout">
        <aside className="safety-sidebar">
          <div className="sidebar-section">
            <h2>Location Sharing</h2>
            <div className="location-status">
              <div className={`status-indicator ${sharingEnabled ? 'status-indicator--on' : 'status-indicator--off'}`}>
                {sharingEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <button onClick={toggleLocationSharing} className="toggle-btn">
                {sharingEnabled ? 'Stop Sharing' : 'Start Sharing'}
              </button>
            </div>
            {currentLat && currentLon && (
              <div className="current-coords">
                <div className="coord-row">
                  <span className="coord-label">Lat:</span>
                  <span className="coord-value">{currentLat}</span>
                </div>
                <div className="coord-row">
                  <span className="coord-label">Lon:</span>
                  <span className="coord-value">{currentLon}</span>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h2>Create Safe Zone</h2>
            <form onSubmit={handleCreateZone} className="safety-form">
              <label>
                Name
                <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Home" />
              </label>
              <label>
                Description
                <input
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  placeholder="Optional description"
                />
              </label>
              <label>
                Latitude
                <input
                  type="number"
                  step="0.000001"
                  value={zoneLat}
                  onChange={(e) => setZoneLat(e.target.value)}
                  placeholder={currentLat || '40.7128'}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="0.000001"
                  value={zoneLon}
                  onChange={(e) => setZoneLon(e.target.value)}
                  placeholder={currentLon || '-74.0060'}
                />
              </label>
              <label>
                Radius (meters)
                <input
                  type="number"
                  step="10"
                  value={zoneRadius}
                  onChange={(e) => setZoneRadius(e.target.value)}
                  placeholder="100"
                />
              </label>
              <label>
                Color
                <input type="color" value={zoneColor} onChange={(e) => setZoneColor(e.target.value)} />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={notifyEntry} onChange={(e) => setNotifyEntry(e.target.checked)} />
                Notify on Entry
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={notifyExit} onChange={(e) => setNotifyExit(e.target.checked)} />
                Notify on Exit
              </label>
              <button type="submit" disabled={!zoneName.trim() || !zoneLat || !zoneLon || creatingZone}>
                {creatingZone ? 'Creating…' : 'Create Zone'}
              </button>
            </form>
          </div>

          <div className="sidebar-section sos-section">
            <h2>SOS Alert</h2>
            <form onSubmit={handleCreateSOS} className="safety-form">
              <label>
                Message (Optional)
                <textarea
                  value={sosMessage}
                  onChange={(e) => setSosMessage(e.target.value)}
                  placeholder="I need help!"
                  rows={3}
                />
              </label>
              <button type="submit" disabled={!currentLat || !currentLon || creatingSos} className="sos-btn">
                {creatingSos ? 'Sending…' : '🚨 Send SOS Alert'}
              </button>
            </form>
          </div>
        </aside>

        <main className="safety-main">
          <div className="view-tabs">
            <button className={view === 'map' ? 'tab-btn active' : 'tab-btn'} onClick={() => setView('map')}>
              Live Map
            </button>
            <button className={view === 'zones' ? 'tab-btn active' : 'tab-btn'} onClick={() => setView('zones')}>
              Safe Zones
            </button>
            <button className={view === 'sos' ? 'tab-btn active' : 'tab-btn'} onClick={() => setView('sos')}>
              SOS Alerts
            </button>
            <button className={view === 'events' ? 'tab-btn active' : 'tab-btn'} onClick={() => setView('events')}>
              Zone Events
            </button>
          </div>

          {view === 'map' && (
            <div className="map-view">
              {locations.length === 0 && <p className="muted">No active locations. Enable sharing to get started.</p>}
              <div className="location-grid">
                {locations.map((loc) => (
                  <div key={loc.id} className="location-card">
                    <div className="location-header">
                      <div className="location-user">{loc.userName}</div>
                      <div className="location-status">
                        <span className="status-dot status-dot--active" />
                        {loc.sharingStatus}
                      </div>
                    </div>
                    <div className="location-coords">
                      <div className="coord-row">
                        <span className="coord-label">Lat:</span>
                        <span className="coord-value">{loc.latitude.toFixed(6)}</span>
                      </div>
                      <div className="coord-row">
                        <span className="coord-label">Lon:</span>
                        <span className="coord-value">{loc.longitude.toFixed(6)}</span>
                      </div>
                      <div className="coord-row">
                        <span className="coord-label">Accuracy:</span>
                        <span className="coord-value">{Math.round(loc.accuracy)}m</span>
                      </div>
                    </div>
                    <div className="location-time">{loc.lastUpdated.toDate().toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'zones' && (
            <div className="zone-list">
              {safeZones.length === 0 && <p className="muted">No safe zones yet. Create one to get started.</p>}
              {safeZones.map((zone) => (
                <div key={zone.id} className="zone-card" style={{ borderLeftColor: zone.color }}>
                  <div className="zone-header">
                    <div className="zone-name">{zone.name}</div>
                    <div className="zone-radius">{zone.radius}m</div>
                  </div>
                  {zone.description && <div className="zone-desc">{zone.description}</div>}
                  <div className="zone-coords">
                    {zone.latitude.toFixed(6)}, {zone.longitude.toFixed(6)}
                  </div>
                  <div className="zone-badges">
                    {zone.notifyOnEntry && <span className="zone-badge">Entry Alert</span>}
                    {zone.notifyOnExit && <span className="zone-badge">Exit Alert</span>}
                  </div>
                  <div className="zone-created">Created {zone.createdAt.toDate().toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {view === 'sos' && (
            <div className="sos-list">
              {sosAlerts.length === 0 && <p className="muted">No SOS alerts. Stay safe!</p>}
              {sosAlerts.map((alert) => (
                <div key={alert.id} className={`sos-card sos-card--${alert.status}`}>
                  <div className="sos-header">
                    <div className="sos-user">{alert.userName}</div>
                    <div className={`sos-status sos-status--${alert.status}`}>{alert.status}</div>
                  </div>
                  {alert.message && <div className="sos-message">{alert.message}</div>}
                  <div className="sos-coords">
                    📍 {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                  </div>
                  <div className="sos-time">{alert.timestamp.toDate().toLocaleString()}</div>
                  {alert.status === 'active' && alert.userId !== user.uid && (
                    <div className="sos-actions">
                      <button onClick={() => handleResolveAlert(alert.id, 'resolved')} className="resolve-btn">
                        Mark Resolved
                      </button>
                      <button onClick={() => handleResolveAlert(alert.id, 'false-alarm')} className="false-alarm-btn">
                        False Alarm
                      </button>
                    </div>
                  )}
                  {alert.resolvedAt && (
                    <div className="sos-resolved">Resolved {alert.resolvedAt.toDate().toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'events' && (
            <div className="event-list">
              {zoneEvents.length === 0 && <p className="muted">No zone events yet.</p>}
              {zoneEvents.map((event) => (
                <div key={event.id} className={`event-card event-card--${event.eventType}`}>
                  <div className="event-header">
                    <div className="event-user">{event.userName}</div>
                    <div className={`event-type event-type--${event.eventType}`}>
                      {event.eventType === 'entry' ? '→ Entered' : '← Exited'}
                    </div>
                  </div>
                  <div className="event-zone">{event.zoneName}</div>
                  <div className="event-time">{event.timestamp.toDate().toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
