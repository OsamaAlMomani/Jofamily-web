// WebRTC ICE helpers.
//
// Some browsers can throw if candidates arrive before `pc.remoteDescription`
// is set. This tiny buffer helps make signaling more robust.

export type IceCandidateBufferRef = { current: RTCIceCandidateInit[] };

export async function safeAddIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
  pendingRef: IceCandidateBufferRef
) {
  if (!pc.remoteDescription) {
    pendingRef.current.push(candidate);
    return;
  }
  await pc.addIceCandidate(candidate);
}

export async function flushPendingCandidates(pc: RTCPeerConnection, pendingRef: IceCandidateBufferRef) {
  if (!pc.remoteDescription) return;
  const pending = pendingRef.current;
  pendingRef.current = [];

  for (const c of pending) {
    try {
      await pc.addIceCandidate(c);
    } catch {
      // Ignore; these can be noisy and are often harmless.
    }
  }
}
