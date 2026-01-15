# RTC / WebRTC Documentation (JoFamily)

This document explains **RTC (Real‑Time Communication)** in the browser—specifically **WebRTC**—and how it would affect and fit into this project.

## 1) What “RTC” means in web projects

In web apps, “RTC” usually means **WebRTC**: a set of browser APIs that let two clients exchange **audio, video, and arbitrary data** in real time.

WebRTC is built around three big pieces:

1. **Media capture** (camera/mic) via `navigator.mediaDevices.getUserMedia()`
2. **Peer connection** (audio/video transport) via `RTCPeerConnection`
3. **Data channel** (low-latency messages/files) via `RTCDataChannel`

### What it is (and is not)

- WebRTC is **transport**, not “video call UI”. You build the UI.
- WebRTC is **peer-to-peer by default** (good latency), but it still needs help for:
  - **Signaling** (exchanging connection metadata)
  - **NAT traversal** (STUN/TURN)

## 2) What you already have in this repo

Your current RTC page is a practice UI:

- `src/pages/RTCPractice/RTCPractice.tsx` is explicitly “UI-only” for WebRTC experiments.
- `src/pages/RTCPractice/Mic_and_Cam.tsx` currently wraps `getUserMedia()` and returns a `MediaStream`.

So today:

- You can request camera/mic permissions and obtain a local `MediaStream`.
- You do **not yet** create a `RTCPeerConnection`, offers/answers, ICE candidates, or data channels.

## 3) How a WebRTC connection actually works (high-level)

Two browsers cannot just “connect” without exchanging metadata. WebRTC needs a **signaling channel** (any backend) to exchange:

- Offer / answer (SDP)
- ICE candidates (network path candidates)

A typical one-to-one call flow:

1. **User A** captures media (optional but common first).
2. **User A** creates a `RTCPeerConnection`.
3. **User A** attaches tracks (`pc.addTrack(track, stream)`).
4. **User A** creates an **offer** (`pc.createOffer()`), sets it locally (`pc.setLocalDescription(offer)`), then sends it to **User B** through signaling.
5. **User B** receives offer, sets it as remote (`pc.setRemoteDescription(offer)`), then creates an **answer**, sets locally, and sends answer back.
6. Both sides also exchange **ICE candidates** as they are discovered.
7. Once ICE selects a working path, the peer connection becomes “connected”.

This is why your UI’s “Offer / Answer / ICE” panels make sense.

## 4) Core concepts you must know

### 4.1 SDP (Session Description Protocol)
SDP is not “the video stream”; it’s a description of:

- Codecs to use (Opus, VP8/VP9/H264, etc.)
- Media directions (sendrecv, recvonly…)
- ICE parameters, DTLS fingerprints, etc.

Your “offer” and “answer” are SDP blobs.

### 4.2 ICE (Interactive Connectivity Establishment)
ICE finds a route between peers:

- Host candidates: local IPs
- Server reflexive candidates: public IPs discovered via **STUN**
- Relay candidates: a **TURN** server relays traffic when direct connection fails

**Most real-world apps require TURN** for reliability.

### 4.3 STUN vs TURN
- **STUN**: helps a peer discover its public-facing address through NAT.
- **TURN**: relays media/data through a server when peers can’t connect directly.

TURN adds cost (bandwidth) but is often mandatory for “it works everywhere”.

### 4.4 Codecs and quality
WebRTC dynamically adapts bitrate and resolution.

Your app’s perceived quality depends on:

- User network quality
- CPU/GPU performance (especially on mobile)
- Chosen constraints and track settings

### 4.5 Security model
WebRTC media is encrypted end-to-end in transit using DTLS/SRTP.

Important constraints:

- `getUserMedia()` requires a **secure context** (HTTPS) except for `localhost`.
- Users must grant permissions (camera/mic).

## 5) What “signaling” is (and what you can use here)

WebRTC does **not** define a signaling protocol.

You can signal via:

- Firestore (easy, already in your project)
- WebSocket server
- REST + polling (works, but clunky)

Because you already have Firebase + Firestore (`src/firebase/firebase.ts`), Firestore is a good fit to implement:

- Rooms collection (by roomId)
- Offer document
- Answer document
- ICE candidates sub-collections

### Example signaling shape (conceptual)

- `rooms/{roomId}`
  - `offer` (SDP)
  - `answer` (SDP)
- `rooms/{roomId}/callerCandidates/{candidateId}`
- `rooms/{roomId}/calleeCandidates/{candidateId}`

(You’ll also want basic auth + security rules, so random users can’t hijack rooms.)

## 6) How RTC would affect your JoFamily project

### 6.1 Hosting and environment
- WebRTC works best with **HTTPS** (Firebase Hosting already provides HTTPS).
- No server is required just to run WebRTC *locally*, but production needs:
  - **Signaling** (Firestore is fine)
  - **TURN** for high success rate

### 6.2 Performance and UX impact
WebRTC adds real-time workloads:

- CPU: encoding/decoding video
- Battery: heavy on mobile
- Network: sustained upload/download

UX changes you should plan for:

- Permission prompts and failure states (blocked permissions)
- Device selection UI (`enumerateDevices()`)
- “No camera/mic found” handling
- Mute/unmute, camera toggle, reconnect

### 6.3 Costs
- Firestore signaling is small (cheap)
- TURN bandwidth can become expensive if calls are frequent or long

Rule of thumb: if users commonly require TURN (mobile networks, strict NATs), your TURN server bandwidth becomes your cost.

### 6.4 Security and privacy
RTC features increase your security surface:

- You will handle camera/mic access → must explain clearly in UI.
- You must secure signaling rooms (auth, access rules, expiry).
- Consider “room codes” and/or membership checks.

### 6.5 Architecture choices (1:1 vs group)
- **1:1 calls**: peer-to-peer is usually okay.
- **Group calls** (3+ participants): mesh P2P scales poorly because each user uploads to every other user.

If you ever add group calls, you’ll likely need an SFU (Selective Forwarding Unit) such as LiveKit/Janus/mediasoup.

## 7) Mapping the concepts to your existing RTCPractice UI

Your UI already mirrors the WebRTC primitives:

- “Start camera” → should call `getUserMedia()` and attach stream to the **Local** video element.
- “Offer/Answer” text areas → are perfect for manual copy/paste SDP while learning.
- “ICE candidates” areas → good for manual exchange or debugging.
- “Data channel/chat” → later you can attach an `RTCDataChannel` and send messages.

### Practical note about implementation style
In React, avoid storing `MediaStream` / `RTCPeerConnection` in React state or in a module-level variable.

Better approach:

- Store them in `useRef()` so they persist without causing re-renders.
- Stop tracks on unmount to release camera/mic:
  - `stream.getTracks().forEach(t => t.stop())`

## 8) Browser support and constraints

- Chrome/Edge/Firefox: strong support.
- Safari (especially iOS): works but has more constraints (user gestures, autoplay rules, and some codec differences).

Common gotchas:

- Video won’t autoplay unless `muted` (for local preview) and/or user interacts.
- iOS Safari may require explicit user interaction to start playback.

## 9) Troubleshooting checklist

When “RTC doesn’t work”, check in this order:

1. Permissions: camera/mic allowed?
2. HTTPS: running in secure context?
3. ICE: are candidates being generated?
4. STUN/TURN: do you have ICE servers configured?
5. NAT issues: can peers connect only on some networks?
6. Logs: `pc.oniceconnectionstatechange`, `pc.onconnectionstatechange`, `pc.onsignalingstatechange`

If calls work on the same Wi‑Fi but fail on mobile data → you probably need TURN.

## 10) Recommended next steps for this repo

1. Implement **local preview** cleanly (refs + cleanup) on the RTCPractice page.
2. Add `RTCPeerConnection` creation + attach tracks.
3. Implement manual SDP copy/paste in two tabs (your UI already suggests this).
4. Add Firestore signaling (rooms + candidates).
5. Add TURN configuration for reliability.
6. Add basic call controls (mute, camera toggle, hang up).

## 11) References

- MDN WebRTC overview: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- `getUserMedia()`: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- `RTCPeerConnection`: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
- `RTCDataChannel`: https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel
