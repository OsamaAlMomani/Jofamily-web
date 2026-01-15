// Shared media helpers for RTC pages.
//
// These are intentionally framework-agnostic (no React). They only deal with
// MediaStreams and HTMLMediaElements.

type CombinedInputs = {
  cameraStream: MediaStream | null;
  micStream: MediaStream | null;
  screenStream: MediaStream | null;
};

/**
 * Builds a combined stream used for local preview + sending to RTCPeerConnection.
 * Video preference: screen share (if active) otherwise camera.
 * Audio: mic (if active).
 */
export function buildLocalCombinedStream({ cameraStream, micStream, screenStream }: CombinedInputs): MediaStream {
  const tracks: MediaStreamTrack[] = [];

  const screenTrack = screenStream?.getVideoTracks?.()[0];
  const cameraTrack = cameraStream?.getVideoTracks?.()[0];
  const micTrack = micStream?.getAudioTracks?.()[0];

  if (screenTrack) tracks.push(screenTrack);
  else if (cameraTrack) tracks.push(cameraTrack);

  if (micTrack) tracks.push(micTrack);

  return new MediaStream(tracks);
}

/** Attach a stream to a <video> element and attempt playback. */
export function setVideoElementStream(video: HTMLVideoElement | null, stream: MediaStream | null) {
  if (!video) return;
  video.srcObject = stream;
  if (stream) {
    void video.play().catch(() => undefined);
  }
}
