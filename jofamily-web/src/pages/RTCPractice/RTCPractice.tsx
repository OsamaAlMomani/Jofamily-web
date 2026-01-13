import { useMemo, useState } from 'react';
import './RTCPractice.css';
import {GetUserMedia} from './Mic_and_Cam.tsx';   

// ===============================================
// RTC Practice Page (UI-only)
// -----------------------------------------------
// This file intentionally does NOT implement WebRTC.
// It provides a structured UI that you can “wire up”
// step-by-step while learning.
// ===============================================

// ===== Types =====
type LogLevel = 'info' | 'warn' | 'error';

type LogEntry = {
  id: string;
  at: number;
  level: LogLevel;
  message: string;
};

// ===== Small utilities =====
function formatTime(ms: number) {
  const date = new Date(ms);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function RTCPractice() {
  // ===== UI state (safe to keep in React state) =====
  const [roomId, setRoomId] = useState('practice-room-1');
  const [displayName, setDisplayName] = useState('');
  const [log, setLog] = useState<LogEntry[]>(() => [
    {
      id: uid(),
      at: Date.now(),
      level: 'info',
      message: 'RTC Practice UI ready. Add WebRTC logic when you’re ready.',
    },
  ]);

  const [offerSdp, setOfferSdp] = useState('');
  const [answerSdp, setAnswerSdp] = useState('');
  const [localCandidates, setLocalCandidates] = useState('');
  const [remoteCandidates, setRemoteCandidates] = useState('');

  const [dataMessage, setDataMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  // ===== Derived state (computed from state) =====
  const logText = useMemo(
    () =>
      log
        .map((e) => `[${formatTime(e.at)}] ${e.level.toUpperCase()}: ${e.message}`)
        .join('\n'),
    [log]
  );

  // ===== Log helpers =====
  function addLog(level: LogLevel, message: string) {
    setLog((prev) => [{ id: uid(), at: Date.now(), level, message }, ...prev].slice(0, 200));
  }

  // ===== Clipboard helper (UI quality-of-life) =====
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      addLog('info', `Copied ${label} to clipboard.`);
    } catch {
      addLog('warn', `Clipboard not available. Manually copy ${label}.`);
    }
  }

  // ===== Reset helpers (UI-only) =====
  function clearAll() {
    setOfferSdp('');
    setAnswerSdp('');
    setLocalCandidates('');
    setRemoteCandidates('');
    setChat([]);
    addLog('info', 'Cleared fields (UI only).');
  }

  // =========================================================
  // CAMERA (getUserMedia) SKETCH — COMMENTED ON PURPOSE
  // ---------------------------------------------------------
  // When you’re ready to implement camera preview, you’ll
  // typically add:
  //
  // 1) Refs (not state) — so they don’t recreate on re-render
  //    const localVideoRef = useRef<HTMLVideoElement | null>(null);
  //    const localStreamRef = useRef<MediaStream | null>(null);
  //
  // 2) Start camera handler
  //    async function startCamera() {
  //      const stream = await navigator.mediaDevices.getUserMedia({
  //        video: true,
  //        audio: false,
  //      });
  //      localStreamRef.current = stream;
  //      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  //    }
  //
  // 3) Cleanup on unmount
  //    useEffect(() => () => {
  //      localStreamRef.current?.getTracks().forEach((t) => t.stop());
  //    }, []);
  //
  // TIP: implement camera preview FIRST (no RTCPeerConnection yet).
  // =========================================================

  return (
    <div className="rtc-page">
      <header className="rtc-topbar">
        <div className="rtc-topbar__left">
          <h1 className="rtc-title">RTC Practice</h1>
          <p className="rtc-subtitle">UI-only sandbox for WebRTC experiments (no RTC implemented yet)</p>
        </div>

        <div className="rtc-topbar__right">
          <div className="rtc-field">
            <label htmlFor="displayName">Name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Osama"
              autoComplete="off"
            />
          </div>

          <div className="rtc-field">
            <label htmlFor="roomId">Room</label>
            <input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="room id"
              autoComplete="off"
            />
          </div>

          <div className="rtc-actions">
            <button
              type="button"
              className="rtc-btn rtc-btn--ghost"
              onClick={() => addLog('info', 'TIP: start with manual copy/paste SDP between two tabs.')}
            >
              Show tip
            </button>
            <button type="button" className="rtc-btn rtc-btn--danger" onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>
      </header>

      <main className="rtc-grid">
        <section className="rtc-card rtc-videos">
          <div className="rtc-card__header">
            <h2>Video</h2>
            <p>Attach streams to these video elements when implementing.</p>
          </div>

          <div className="rtc-videoGrid">
            <div className="rtc-videoTile">
              <div className="rtc-videoTile__label">Local</div>
              <video className="rtc-video" playsInline muted />
              <div className="rtc-videoHint">localVideoRef.current.srcObject = localStream</div>
            </div>

            <div className="rtc-videoTile">
              <div className="rtc-videoTile__label">Remote</div>
              <video className="rtc-video" playsInline />
              <div className="rtc-videoHint">remoteVideoRef.current.srcObject = remoteStream</div>
            </div>
          </div>

          <div className="rtc-toolbar">
            {/*
              CAMERA BUTTON (UI-only for now)

              When implementing, replace the addLog(...) with:
              - await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
              - localVideoRef.current.srcObject = stream

              Keep your RTCPeerConnection + MediaStream in refs, not state.
            */}
            <button
              type="button"
              className="rtc-btn"
              onClick={GetUserMedia}
            >
              Start camera
            </button>
            <button
              type="button"
              className="rtc-btn"
              onClick={() => addLog('info', 'Start Mic clicked (UI only).')}
            >
              Start mic
            </button>
            <button
              type="button"
              className="rtc-btn"
              onClick={() => addLog('info', 'Share Screen clicked (UI only).')}
            >
              Share screen
            </button>
            <span className="rtc-spacer" />
            <button
              type="button"
              className="rtc-btn rtc-btn--ghost"
              onClick={() => addLog('warn', 'Add device selection via navigator.mediaDevices.enumerateDevices().')}
            >
              Device picker (later)
            </button>
          </div>
        </section>

        <section className="rtc-card rtc-signaling">
          <div className="rtc-card__header">
            <h2>Signaling Workbench</h2>
            <p>Use this area to practice offer/answer + ICE copy/paste or Firebase/WebSocket signaling.</p>
          </div>

          <div className="rtc-signalingGrid">
            <div className="rtc-panel">
              <div className="rtc-panel__title">
                <h3>Offer (SDP)</h3>
                <div className="rtc-panel__actions">
                  <button
                    type="button"
                    className="rtc-btn rtc-btn--ghost"
                    onClick={() => copy(offerSdp, 'offer')}
                    disabled={!offerSdp.trim()}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rtc-btn"
                    onClick={() => addLog('info', 'Create Offer clicked (UI only).')}
                  >
                    Create
                  </button>
                </div>
              </div>
              <textarea
                className="rtc-textarea"
                value={offerSdp}
                onChange={(e) => setOfferSdp(e.target.value)}
                placeholder="Paste/generate offer SDP here"
              />
            </div>

            <div className="rtc-panel">
              <div className="rtc-panel__title">
                <h3>Answer (SDP)</h3>
                <div className="rtc-panel__actions">
                  <button
                    type="button"
                    className="rtc-btn rtc-btn--ghost"
                    onClick={() => copy(answerSdp, 'answer')}
                    disabled={!answerSdp.trim()}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rtc-btn"
                    onClick={() => addLog('info', 'Create Answer clicked (UI only).')}
                  >
                    Create
                  </button>
                </div>
              </div>
              <textarea
                className="rtc-textarea"
                value={answerSdp}
                onChange={(e) => setAnswerSdp(e.target.value)}
                placeholder="Paste/generate answer SDP here"
              />
            </div>

            <div className="rtc-panel">
              <div className="rtc-panel__title">
                <h3>Local ICE Candidates</h3>
                <div className="rtc-panel__actions">
                  <button
                    type="button"
                    className="rtc-btn rtc-btn--ghost"
                    onClick={() => copy(localCandidates, 'local candidates')}
                    disabled={!localCandidates.trim()}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="rtc-btn"
                    onClick={() => addLog('info', 'Gather candidates clicked (UI only).')}
                  >
                    Gather
                  </button>
                </div>
              </div>
              <textarea
                className="rtc-textarea"
                value={localCandidates}
                onChange={(e) => setLocalCandidates(e.target.value)}
                placeholder="Each candidate on its own line or JSON"
              />
            </div>

            <div className="rtc-panel">
              <div className="rtc-panel__title">
                <h3>Remote ICE Candidates</h3>
                <div className="rtc-panel__actions">
                  <button
                    type="button"
                    className="rtc-btn"
                    onClick={() => addLog('info', 'Apply remote candidates clicked (UI only).')}
                    disabled={!remoteCandidates.trim()}
                  >
                    Apply
                  </button>
                </div>
              </div>
              <textarea
                className="rtc-textarea"
                value={remoteCandidates}
                onChange={(e) => setRemoteCandidates(e.target.value)}
                placeholder="Paste remote candidates here"
              />
            </div>
          </div>

          <div className="rtc-steps">
            <h3>Suggested practice flow</h3>
            <ol>
              <li>Open this page in two tabs (A and B).</li>
              <li>On A: Create Offer → copy → paste into B.</li>
              <li>On B: Create Answer → copy → paste into A.</li>
              <li>Exchange ICE candidates both ways (or via a signaling store).</li>
            </ol>
          </div>
        </section>

        <section className="rtc-card rtc-data">
          <div className="rtc-card__header">
            <h2>Data Channel / Chat</h2>
            <p>UI placeholder for practicing RTCDataChannel later.</p>
          </div>

          <div className="rtc-chat">
            <div className="rtc-chat__list" aria-label="Chat messages">
              {chat.length === 0 ? (
                <div className="rtc-chat__empty">No messages yet.</div>
              ) : (
                chat.map((m, idx) => (
                  <div key={`${idx}-${m}`} className="rtc-chat__msg">
                    {m}
                  </div>
                ))
              )}
            </div>

            <div className="rtc-chat__composer">
              <input
                value={dataMessage}
                onChange={(e) => setDataMessage(e.target.value)}
                placeholder="Type a message (UI only)"
              />
              <button
                type="button"
                className="rtc-btn"
                onClick={() => {
                  if (!dataMessage.trim()) return;
                  setChat((prev) => [...prev, `${displayName || 'You'}: ${dataMessage.trim()}`]);
                  setDataMessage('');
                  addLog('info', 'Send clicked (UI only).');
                }}
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <section className="rtc-card rtc-logs">
          <div className="rtc-card__header">
            <h2>Logs</h2>
            <p>Use logs while wiring events.</p>
          </div>

          <div className="rtc-logActions">
            <button type="button" className="rtc-btn rtc-btn--ghost" onClick={() => setLog([])}>
              Clear logs
            </button>
            <button type="button" className="rtc-btn rtc-btn--ghost" onClick={() => copy(logText, 'logs')}>
              Copy logs
            </button>
          </div>

          <pre className="rtc-log" aria-label="Logs">
            {logText || 'No logs yet.'}
          </pre>
        </section>
      </main>

      <footer className="rtc-footer">
        <div className="rtc-footer__inner">
          <div>
            <strong>Next:</strong> add WebRTC pieces incrementally (getUserMedia → RTCPeerConnection → ICE → TURN).
          </div>
          <div className="rtc-footer__hint">
            Route: <span className="rtc-mono">/rtc-practice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
