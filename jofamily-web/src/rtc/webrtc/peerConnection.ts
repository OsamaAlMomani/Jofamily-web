// RTCPeerConnection helpers.
//
// Goal: keep RTC pages focused on UI state, while centralizing the tricky,
// easy-to-forget wiring (remote stream attachment, state change logging, etc).

export type LogLevel = 'info' | 'warn' | 'error';

export type CreatePeerConnectionDeps = {
  addLog: (level: LogLevel, message: string) => void;
  remoteStream: MediaStream;
  remoteVideo: HTMLVideoElement | null;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
};

export function wireRemoteVideo(remoteVideo: HTMLVideoElement | null, remoteStream: MediaStream) {
  if (!remoteVideo) return;
  remoteVideo.srcObject = remoteStream;
  void remoteVideo.play().catch(() => undefined);
}

export function createPeerConnection(deps: CreatePeerConnectionDeps) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  });

  wireRemoteVideo(deps.remoteVideo, deps.remoteStream);

  pc.ontrack = (event) => {
    event.streams[0]?.getTracks().forEach((t) => deps.remoteStream.addTrack(t));
    deps.addLog('info', `Remote track received: ${event.track.kind}`);
  };

  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    deps.onIceCandidate?.(event.candidate);
  };

  pc.onicegatheringstatechange = () => {
    deps.addLog('info', `ICE gathering: ${pc.iceGatheringState}`);
  };

  pc.onsignalingstatechange = () => {
    deps.addLog('info', `Signaling: ${pc.signalingState}`);
  };

  pc.oniceconnectionstatechange = () => {
    deps.addLog('info', `ICE connection: ${pc.iceConnectionState}`);
  };

  pc.onconnectionstatechange = () => {
    deps.onConnectionStateChange?.(pc.connectionState);
    deps.addLog('info', `Peer connection: ${pc.connectionState}`);
  };

  return pc;
}

/**
 * Replace all currently-sent tracks with tracks from `stream`.
 * Useful when switching between camera and screen share.
 */
export function replacePeerTracks(pc: RTCPeerConnection, stream: MediaStream) {
  pc.getSenders().forEach((s) => {
    try {
      pc.removeTrack(s);
    } catch {
      // ignore
    }
  });

  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });
}
