import type { RefObject } from 'react';
import type { LogLevel } from '../../../rtc/webrtc/peerConnection';

type Props = {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;

  isMicOn: boolean;
  isScreenOn: boolean;
  micLevel: number;

  cameraDevices: MediaDeviceInfo[];
  microphoneDevices: MediaDeviceInfo[];
  selectedCameraId: string;
  selectedMicrophoneId: string;

  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleMic: () => void;
  onToggleScreen: () => void;
  onChangeCameraId: (id: string) => void;
  onChangeMicrophoneId: (id: string) => void;
  onRefreshDevices: () => void;

  addLog: (level: LogLevel, message: string) => void;
};

export function RTCVideoPanel(props: Props) {
  return (
    <section className="rtc-card rtc-videos">
      <div className="rtc-card__header">
        <h2>Video</h2>
        <p>Local/remote video preview elements.</p>
      </div>

      <div className="rtc-videoGrid">
        <div className="rtc-videoTile">
          <div className="rtc-videoTile__label">Local</div>
          <video ref={props.localVideoRef} className="rtc-video" playsInline muted />
          <div className="rtc-videoHint">localVideoRef.current.srcObject = localStream</div>
        </div>

        <div className="rtc-videoTile">
          <div className="rtc-videoTile__label">Remote</div>
          <video ref={props.remoteVideoRef} className="rtc-video" playsInline />
          <div className="rtc-videoHint">remoteVideoRef.current.srcObject = remoteStream</div>
        </div>
      </div>

      <div className="rtc-toolbar">
        <button type="button" className="rtc-btn" onClick={props.onStartCamera}>
          Start camera
        </button>
        <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onStopCamera}>
          Stop camera
        </button>

        <button type="button" className="rtc-btn" onClick={props.onToggleMic}>
          {props.isMicOn ? 'Stop mic' : 'Start mic'}
        </button>
        <div className="rtc-meter" aria-label="Microphone level">
          <div
            className="rtc-meter__bar"
            style={{ width: `${Math.min(100, Math.round(props.micLevel * 140))}%` }}
          />
        </div>

        <button type="button" className="rtc-btn" onClick={props.onToggleScreen}>
          {props.isScreenOn ? 'Stop share' : 'Share screen'}
        </button>

        <span className="rtc-spacer" />

        <div className="rtc-field">
          <label htmlFor="cameraDevice">Camera</label>
          <select
            id="cameraDevice"
            value={props.selectedCameraId}
            onChange={(e) => props.onChangeCameraId(e.target.value)}
          >
            <option value="">Default</option>
            {props.cameraDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera (${d.deviceId.slice(0, 6)}…)`}
              </option>
            ))}
          </select>
        </div>

        <div className="rtc-field">
          <label htmlFor="micDevice">Mic</label>
          <select
            id="micDevice"
            value={props.selectedMicrophoneId}
            onChange={(e) => props.onChangeMicrophoneId(e.target.value)}
          >
            <option value="">Default</option>
            {props.microphoneDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mic (${d.deviceId.slice(0, 6)}…)`}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onRefreshDevices}>
          Refresh devices
        </button>

        <button
          type="button"
          className="rtc-btn rtc-btn--ghost"
          onClick={() => props.addLog('info', 'Tip: if camera prompts the wrong device, select it from the dropdown then start camera again.')}
          style={{ display: 'none' }}
        >
          Hidden debug
        </button>
      </div>
    </section>
  );
}
