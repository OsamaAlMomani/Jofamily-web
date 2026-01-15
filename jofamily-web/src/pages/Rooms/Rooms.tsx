import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rooms.css';
import { generateRoomId } from '../../rtc/id';
import { buildRtcRoomLink, buildRtcRoomPath } from '../../rtc/routing';

/**
 * Rooms page
 *
 * Business goal:
 * - Give users a simple entry point to create or join an RTC room.
 * - After they choose a room, we navigate to the actual call page:
 *   `/rtc-practice/:roomId`
 */
export default function Rooms() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [roomId, setRoomId] = useState('');

  const normalizedRoomId = useMemo(() => roomId.trim(), [roomId]);

  function goToRoom(id: string) {
    navigate(buildRtcRoomPath(id));
  }

  async function copyRoomLink(id: string) {
    const link = buildRtcRoomLink(id);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // If clipboard fails, user can still copy from the input.
    }
  }

  return (
    <div className="rooms-page">
      <div className="rooms-card">
        <div className="rooms-card__header">
          <h1>Rooms</h1>
          <p>Create a room link to call someone, or join an existing room.</p>
        </div>

        <div className="rooms-card__body">
          <div className="rooms-grid">
            <div>
              <div className="rooms-field">
                <label htmlFor="displayName">Name (optional)</label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Osama"
                  autoComplete="off"
                />
              </div>

              <div style={{ height: 12 }} />

              <div className="rooms-field">
                <label htmlFor="roomId">Room ID</label>
                <input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Paste a room id or create a new one"
                  autoComplete="off"
                />
              </div>

              <div style={{ height: 12 }} />

              <div className="rooms-actions">
                <button
                  type="button"
                  className="rooms-btn"
                  onClick={() => {
                    const id = generateRoomId();
                    setRoomId(id);
                    void copyRoomLink(id);
                    goToRoom(id);
                  }}
                >
                  Create room
                </button>

                <button
                  type="button"
                  className="rooms-btn rooms-btn--ghost"
                  onClick={() => {
                    if (!normalizedRoomId) return;
                    void copyRoomLink(normalizedRoomId);
                  }}
                  disabled={!normalizedRoomId}
                >
                  Copy link
                </button>

                <button
                  type="button"
                  className="rooms-btn"
                  onClick={() => {
                    if (!normalizedRoomId) return;
                    goToRoom(normalizedRoomId);
                  }}
                  disabled={!normalizedRoomId}
                >
                  Join room
                </button>

                <button
                  type="button"
                  className="rooms-btn rooms-btn--danger"
                  onClick={() => {
                    setRoomId('');
                    setDisplayName('');
                  }}
                >
                  Clear
                </button>
              </div>

              {/*
                NOTE:
                We are not persisting displayName yet.
                If you want, next step is to pass it via query param or store in localStorage,
                then RTCPractice can read and use it.
              */}
            </div>

            <div className="rooms-help">
              <div>
                <strong>How it works</strong>
              </div>
              <ul>
                <li>
                  Create room → you navigate to <span className="rooms-mono">/rtc-practice/&lt;roomId&gt;</span>
                </li>
                <li>Send the link to a friend</li>
                <li>The friend opens the link and joins</li>
              </ul>

              <div>
                <strong>Important</strong>
              </div>
              <ul>
                <li>Both users must allow camera/microphone permissions in the browser.</li>
                <li>For best reliability across networks, TURN will be needed later.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
