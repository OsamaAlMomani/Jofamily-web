import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './RTCPractice.css';
import { GetUserMedia } from './Mic_and_Cam.tsx';
import { RTCHeader } from './components/RTCHeader';
import { RTCVideoPanel } from './components/RTCVideoPanel';
import { RTCSignalingWorkbench } from './components/RTCSignalingWorkbench';
import { RTCChatPanel } from './components/RTCChatPanel';
import { RTCLogsPanel } from './components/RTCLogsPanel';
import { RTCFooter } from './components/RTCFooter';
import { db } from '../../firebase/firebase';
import { generateRoomId } from '../../rtc/id';
import { buildRtcRoomLink, buildRtcRoomPath } from '../../rtc/routing';
import { buildLocalCombinedStream, setVideoElementStream } from '../../rtc/media/combinedStream';
import { flushPendingCandidates as flushPendingCandidatesRtc, safeAddIceCandidate as safeAddIceCandidateRtc } from '../../rtc/webrtc/ice';
import { createPeerConnection, replacePeerTracks } from '../../rtc/webrtc/peerConnection';
import {
  createRoomDoc,
  deleteRoom,
  getRoomRef,
  listenForAnswer,
  listenForCandidates,
  writeCandidate,
  writeRoomAnswer,
  type CandidateCollectionName,
} from '../../rtc/signaling/firestoreRooms';
import {
  getDoc,
  type Unsubscribe,
} from 'firebase/firestore';

// ===============================================
// RTC Practice Page (UI + orchestration)
// -----------------------------------------------
// This page is a WebRTC sandbox UI.
// Core logic is split into small helpers under:
// - src/rtc/media/*      (local streams + preview helpers)
// - src/rtc/webrtc/*     (RTCPeerConnection + ICE helpers)
// - src/rtc/signaling/*  (Firestore room signaling helpers)
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
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  function navigateToRoom(id: string, replace = false) {
    navigate(buildRtcRoomPath(id), { replace });
  }

  function navigateToLobby(replace = false) {
    navigate('/rtc-practice', { replace });
  }
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const localCombinedStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const activeRoomIdRef = useRef<string | null>(null);
  const roleRef = useRef<'caller' | 'callee' | null>(null);
  const roomDocUnsubRef = useRef<Unsubscribe | null>(null);
  const remoteCandidatesUnsubRef = useRef<Unsubscribe | null>(null);
  const pendingRemoteCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const micAudioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micRafRef = useRef<number | null>(null);

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
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>('');

  const [micLevel, setMicLevel] = useState<number>(0);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isScreenOn, setIsScreenOn] = useState<boolean>(false);

  const [isPeerConnected, setIsPeerConnected] = useState<boolean>(false);

  const [signalingRole, setSignalingRole] = useState<'caller' | 'callee' | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

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

  function updateLocalCombinedStream() {
    const stream = buildLocalCombinedStream({
      cameraStream: localStreamRef.current,
      micStream: micStreamRef.current,
      screenStream: screenStreamRef.current,
    });
    localCombinedStreamRef.current = stream;

    // Local preview shows whichever video track is active.
    setVideoElementStream(localVideoRef.current, stream);

    return stream;
  }

  function cleanupFirestoreSignaling() {
    roomDocUnsubRef.current?.();
    roomDocUnsubRef.current = null;

    remoteCandidatesUnsubRef.current?.();
    remoteCandidatesUnsubRef.current = null;

    pendingRemoteCandidatesRef.current = [];
    activeRoomIdRef.current = null;
    roleRef.current = null;
    setSignalingRole(null);
    setActiveRoomId(null);
  }

  async function safeAddIceCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidateInit) {
    await safeAddIceCandidateRtc(pc, candidate, pendingRemoteCandidatesRef);
  }

  async function flushPendingCandidates(pc: RTCPeerConnection) {
    await flushPendingCandidatesRtc(pc, pendingRemoteCandidatesRef);
  }

  function ensurePeerConnection() {
    if (pcRef.current) return pcRef.current;

    if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();

    const pc = createPeerConnection({
      addLog,
      remoteStream: remoteStreamRef.current,
      remoteVideo: remoteVideoRef.current,
      onConnectionStateChange: (state) => {
        setIsPeerConnected(state === 'connected');
      },
      onIceCandidate: (candidate) => {
        const json = JSON.stringify(candidate.toJSON());
        setLocalCandidates((prev) => (prev.trim() ? `${prev.trim()}\n${json}` : json));

        const roomIdForSignaling = activeRoomIdRef.current;
        const roleForSignaling = roleRef.current;
        if (!roomIdForSignaling || !roleForSignaling) return;

        const sub: CandidateCollectionName = roleForSignaling === 'caller' ? 'callerCandidates' : 'calleeCandidates';
        void writeCandidate(db, roomIdForSignaling, sub, candidate.toJSON()).catch((err) => {
          const e = err as { name?: string; message?: string };
          addLog('warn', `Failed to write ICE candidate: ${e.name || 'Error'} ${e.message || ''}`.trim());
        });
      },
    });

    pcRef.current = pc;
    addLog('info', 'RTCPeerConnection created.');
    return pc;
  }

  function closePeerConnection() {
    cleanupFirestoreSignaling();

    const pc = pcRef.current;
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onicegatheringstatechange = null;
      pc.onsignalingstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.onconnectionstatechange = null;
      pc.getSenders().forEach((s) => {
        try {
          pc.removeTrack(s);
        } catch {
          // ignore
        }
      });
      pc.close();
      pcRef.current = null;
    }

    remoteStreamRef.current?.getTracks().forEach((t) => remoteStreamRef.current?.removeTrack(t));
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;

    setIsPeerConnected(false);
    addLog('info', 'RTCPeerConnection closed.');
  }

  async function createRoomWithFirestore() {
    try {
      closePeerConnection();

      const id = (roomId || '').trim() || generateRoomId();
      setRoomId(id);
      navigateToRoom(id);

      const pc = ensurePeerConnection();
      await attachLocalTracksToPeerConnection(pc);

      setLocalCandidates('');
      setRemoteCandidates('');

      // Mark signaling role BEFORE creating offer so ICE candidates get written to Firestore.
      activeRoomIdRef.current = id;
      roleRef.current = 'caller';
      setSignalingRole('caller');
      setActiveRoomId(id);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const localDesc = pc.localDescription;
      if (!localDesc) {
        throw new Error('Missing localDescription after createOffer/setLocalDescription');
      }

      await createRoomDoc(db, id, displayName, localDesc);

      setOfferSdp(JSON.stringify(localDesc));
      addLog('info', `Room created: ${id}. Share the link or room id with the other person.`);

      // Listen for answer
      roomDocUnsubRef.current = listenForAnswer(db, id, async (answer) => {
        if (pc.currentRemoteDescription) return;
        await pc.setRemoteDescription(answer);
        setAnswerSdp(JSON.stringify(answer));
        addLog('info', 'Answer received and applied.');
        await flushPendingCandidates(pc);
      });

      // Listen for callee ICE candidates
      remoteCandidatesUnsubRef.current = listenForCandidates(db, id, 'calleeCandidates', (candidate) => {
        void safeAddIceCandidate(pc, candidate).catch(() => undefined);
      });
    } catch (err) {
      cleanupFirestoreSignaling();
      const e = err as { name?: string; message?: string };
      addLog('error', `Create room failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function joinRoomWithFirestore() {
    try {
      closePeerConnection();

      const id = (roomId || '').trim();
      if (!id) {
        addLog('warn', 'Enter a room id first.');
        return;
      }

      navigateToRoom(id);

      const roomRef = getRoomRef(db, id);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        addLog('error', `Room not found: ${id}`);
        return;
      }

      const data = snap.data() as { offer?: RTCSessionDescriptionInit };
      if (!data.offer) {
        addLog('error', 'Room exists but has no offer yet.');
        return;
      }

      const pc = ensurePeerConnection();

      // Mark signaling role BEFORE setting descriptions so ICE candidates get written to Firestore.
      activeRoomIdRef.current = id;
      roleRef.current = 'callee';
      setSignalingRole('callee');
      setActiveRoomId(id);

      setLocalCandidates('');
      setRemoteCandidates('');

      await pc.setRemoteDescription(data.offer);
      setOfferSdp(JSON.stringify(data.offer));

      await attachLocalTracksToPeerConnection(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const localDesc = pc.localDescription;
      if (!localDesc) {
        throw new Error('Missing localDescription after createAnswer/setLocalDescription');
      }

      await writeRoomAnswer(db, id, displayName, localDesc);

      setAnswerSdp(JSON.stringify(localDesc));
      addLog('info', 'Joined room and posted answer.');

      // Listen for caller ICE candidates
      remoteCandidatesUnsubRef.current = listenForCandidates(db, id, 'callerCandidates', (candidate) => {
        void safeAddIceCandidate(pc, candidate).catch(() => undefined);
      });

      await flushPendingCandidates(pc);
    } catch (err) {
      cleanupFirestoreSignaling();
      const e = err as { name?: string; message?: string };
      addLog('error', `Join room failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function endRoomIfCaller() {
    try {
      const id = activeRoomIdRef.current;
      const role = roleRef.current;
      if (!id || role !== 'caller') {
        closePeerConnection();
        navigateToLobby();
        return;
      }

      // Best-effort cleanup (not required for functionality).
      cleanupFirestoreSignaling();
      closePeerConnection();

      await deleteRoom(db, id);
      navigateToLobby();
      addLog('info', `Room ended (deleted): ${id}`);
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('warn', `End room failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function copyRoomLink() {
    const id = (activeRoomId || roomId || '').trim();
    if (!id) {
      addLog('warn', 'No room id to copy.');
      return;
    }
    await copy(buildRtcRoomLink(id), 'room link');
  }

  async function attachLocalTracksToPeerConnection(pc: RTCPeerConnection) {
    const local = updateLocalCombinedStream();
    replacePeerTracks(pc, local);
  }

  async function createOffer() {
    try {
      setLocalCandidates('');
      const pc = ensurePeerConnection();
      await attachLocalTracksToPeerConnection(pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setOfferSdp(JSON.stringify(pc.localDescription));
      addLog('info', 'Offer created and set as local description. Copy/paste it to the other tab.');
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `createOffer failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function createAnswerFromOffer() {
    try {
      setLocalCandidates('');
      const pc = ensurePeerConnection();

      const offer = JSON.parse(offerSdp) as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(offer);
      await attachLocalTracksToPeerConnection(pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      setAnswerSdp(JSON.stringify(pc.localDescription));
      addLog('info', 'Answer created. Copy/paste it back to the caller tab, then click Apply Answer there.');
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `createAnswer failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function applyAnswer() {
    try {
      const pc = ensurePeerConnection();
      const answer = JSON.parse(answerSdp) as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(answer);
      addLog('info', 'Remote answer applied.');
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `applyAnswer failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function applyRemoteIceCandidates() {
    try {
      const pc = ensurePeerConnection();

      const text = remoteCandidates.trim();
      if (!text) {
        addLog('warn', 'No remote candidates to apply.');
        return;
      }

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      let applied = 0;

      for (const line of lines) {
        let candidateInit: RTCIceCandidateInit;
        try {
          candidateInit = JSON.parse(line) as RTCIceCandidateInit;
        } catch {
          addLog('warn', 'Failed to parse a candidate line. Paste JSON lines produced by this page.');
          continue;
        }
        await pc.addIceCandidate(candidateInit);
        applied += 1;
      }

      addLog('info', `Applied ${applied} remote ICE candidate(s).`);
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `applyRemoteCandidates failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      addLog('warn', 'enumerateDevices() not available in this browser.');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setCameraDevices(videos);
      setMicrophoneDevices(mics);
      addLog('info', `Found ${videos.length} camera device(s) and ${mics.length} microphone(s).`);
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `Failed to enumerate devices: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function stopCamera() {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    updateLocalCombinedStream();
    addLog('info', 'Camera stopped.');
  }

  function stopMicLevelMeter() {
    if (micRafRef.current != null) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    micAnalyserRef.current = null;
    if (micAudioContextRef.current) {
      // Close in a fire-and-forget way to avoid blocking UI.
      void micAudioContextRef.current.close();
      micAudioContextRef.current = null;
    }
    setMicLevel(0);
  }

  async function stopMic() {
    const stream = micStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    stopMicLevelMeter();
    setIsMicOn(false);
    updateLocalCombinedStream();
    addLog('info', 'Microphone stopped.');
  }

  function startMicLevelMeter(stream: MediaStream) {
    stopMicLevelMeter();

    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      addLog('warn', 'AudioContext not available; mic level meter disabled.');
      return;
    }

    const audioContext = new AudioContextCtor();
    micAudioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    micAnalyserRef.current = analyser;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    const tick = () => {
      const a = micAnalyserRef.current;
      if (!a) return;
      a.getByteTimeDomainData(data);

      // Compute RMS in [0..1]
      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);

      // Light smoothing to keep UI stable
      setMicLevel((prev) => prev * 0.75 + rms * 0.25);
      micRafRef.current = requestAnimationFrame(tick);
    };

    micRafRef.current = requestAnimationFrame(tick);
  }

  async function startMic() {
    try {
      await stopMic();

      const constraints: MediaStreamConstraints = {
        video: false,
        audio: selectedMicrophoneId
          ? { deviceId: { exact: selectedMicrophoneId } }
          : true,
      };

      const stream = await GetUserMedia(constraints);
      micStreamRef.current = stream;
      setIsMicOn(true);

      const track = stream.getAudioTracks()[0];
      const label = track?.label || '(no label yet — permission may be pending)';
      addLog('info', `Microphone started. Track label: ${label}`);

      startMicLevelMeter(stream);
      updateLocalCombinedStream();
      await refreshDevices();
    } catch (err) {
      const e = err as { name?: string; message?: string };
      setIsMicOn(false);
      addLog('error', `startMic failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function stopScreenShare() {
    const stream = screenStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenOn(false);

    // If local video currently shows the screen stream, clear it.
    if (localVideoRef.current) {
      const current = localVideoRef.current.srcObject;
      if (current === stream) {
        localVideoRef.current.srcObject = null;
      }
    }

    addLog('info', 'Screen share stopped.');
    updateLocalCombinedStream();
  }

  async function startScreenShare() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      addLog('error', 'Screen sharing is not supported in this browser.');
      return;
    }

    try {
      await stopScreenShare();
      await stopCamera();

      // Keep it simple for now: video only.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      screenStreamRef.current = stream;
      setIsScreenOn(true);

      // When user stops sharing from the browser UI, the track ends.
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          void stopScreenShare();
        });
      }

      updateLocalCombinedStream();

      addLog('info', 'Screen share started (local preview updated).');
    } catch (err) {
      const e = err as { name?: string; message?: string };
      setIsScreenOn(false);
      addLog('error', `startScreenShare failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  async function startCamera() {
    try {
      await stopScreenShare();
      await stopCamera();

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : true,
      };

      const stream = await GetUserMedia(constraints);
      localStreamRef.current = stream;

      updateLocalCombinedStream();

      const track = stream.getVideoTracks()[0];
      const label = track?.label || '(no label yet — permission may be pending)';
      const settings = track?.getSettings?.();

      addLog('info', `Camera started. Track label: ${label}`);
      if (settings?.width && settings?.height) {
        addLog('info', `Camera settings: ${settings.width}x${settings.height} @ ${settings.frameRate || '?'}fps`);
      }

      // After permission grant, labels become available — refresh device list to show names.
      await refreshDevices();
    } catch (err) {
      const e = err as { name?: string; message?: string };
      addLog('error', `getUserMedia failed: ${e.name || 'Error'} ${e.message || ''}`.trim());
    }
  }

  useEffect(() => {
    // Preferred: /rtc-practice/:roomId
    const fromPath = typeof params.roomId === 'string' ? decodeURIComponent(params.roomId) : null;

    // Backward-compatible: /rtc-practice?room=...
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('room');

    if (fromPath) {
      setRoomId(fromPath);
      addLog('info', `Loaded room from URL: ${fromPath}`);
    } else if (fromQuery) {
      setRoomId(fromQuery);
      addLog('info', `Loaded room from legacy link: ${fromQuery}`);
      // Immediately convert to the new URL format.
      navigateToRoom(fromQuery, true);
    }

    void refreshDevices();
    return () => {
      void stopCamera();
      void stopMic();
      void stopScreenShare();
      closePeerConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If user manually edits the URL while staying on the page, keep roomId in sync.
  useEffect(() => {
    const fromPath = typeof params.roomId === 'string' ? decodeURIComponent(params.roomId) : '';
    if (fromPath && fromPath !== roomId) {
      setRoomId(fromPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="rtc-page">
      <RTCHeader
        displayName={displayName}
        roomId={roomId}
        activeRoomId={activeRoomId}
        signalingRole={signalingRole}
        isPeerConnected={isPeerConnected}
        onChangeDisplayName={setDisplayName}
        onChangeRoomId={setRoomId}
        onShowTip={() => addLog('info', 'TIP: start with manual copy/paste SDP between two tabs.')}
        onClear={clearAll}
        onCreateRoom={createRoomWithFirestore}
        onJoinRoom={joinRoomWithFirestore}
        onCopyLink={copyRoomLink}
        onLeaveOrEnd={endRoomIfCaller}
        addLog={addLog}
      />

      <main className="rtc-grid">
        <RTCVideoPanel
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isMicOn={isMicOn}
          isScreenOn={isScreenOn}
          micLevel={micLevel}
          cameraDevices={cameraDevices}
          microphoneDevices={microphoneDevices}
          selectedCameraId={selectedCameraId}
          selectedMicrophoneId={selectedMicrophoneId}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onToggleMic={() => (isMicOn ? void stopMic() : void startMic())}
          onToggleScreen={() => (isScreenOn ? void stopScreenShare() : void startScreenShare())}
          onChangeCameraId={setSelectedCameraId}
          onChangeMicrophoneId={setSelectedMicrophoneId}
          onRefreshDevices={refreshDevices}
          addLog={addLog}
        />

        <RTCSignalingWorkbench
          offerSdp={offerSdp}
          answerSdp={answerSdp}
          localCandidates={localCandidates}
          remoteCandidates={remoteCandidates}
          onChangeOfferSdp={setOfferSdp}
          onChangeAnswerSdp={setAnswerSdp}
          onChangeLocalCandidates={setLocalCandidates}
          onChangeRemoteCandidates={setRemoteCandidates}
          onCopy={copy}
          onCreateOffer={createOffer}
          onCreateAnswerFromOffer={createAnswerFromOffer}
          onApplyAnswer={applyAnswer}
          onApplyRemoteIceCandidates={applyRemoteIceCandidates}
          onShowGatherTip={() =>
            addLog('info', 'ICE candidates are gathered automatically after Create Offer/Answer. Copy them to the other tab.')
          }
          onHangup={closePeerConnection}
          isPeerConnected={isPeerConnected}
        />

        <RTCChatPanel
          chat={chat}
          dataMessage={dataMessage}
          displayName={displayName}
          onChangeMessage={setDataMessage}
          onSend={() => {
            if (!dataMessage.trim()) return;
            setChat((prev) => [...prev, `${displayName || 'You'}: ${dataMessage.trim()}`]);
            setDataMessage('');
            addLog('info', 'Send clicked (UI only).');
          }}
        />

        <RTCLogsPanel
          logText={logText}
          onClearLogs={() => setLog([])}
          onCopyLogs={() => copy(logText, 'logs')}
        />
      </main>

      <RTCFooter />
    </div>
  );
}
