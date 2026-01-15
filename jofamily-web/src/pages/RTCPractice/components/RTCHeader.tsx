import type { LogLevel } from '../../../rtc/webrtc/peerConnection';

type Props = {
  displayName: string;
  roomId: string;
  activeRoomId: string | null;
  signalingRole: 'caller' | 'callee' | null;
  isPeerConnected: boolean;

  onChangeDisplayName: (value: string) => void;
  onChangeRoomId: (value: string) => void;

  onShowTip: () => void;
  onClear: () => void;

  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onCopyLink: () => void;
  onLeaveOrEnd: () => void;

  addLog: (level: LogLevel, message: string) => void;
};

export function RTCHeader(props: Props) {
  const subtitle =
    `WebRTC sandbox (camera/mic/screen + manual SDP or Firestore rooms)` +
    (props.activeRoomId ? ` — room: ${props.activeRoomId}` : '') +
    (props.signalingRole ? ` — role: ${props.signalingRole}` : '') +
    (props.isPeerConnected ? ' — connected' : '');

  return (
    <header className="rtc-topbar">
      <div className="rtc-topbar__left">
        <h1 className="rtc-title">RTC Practice</h1>
        <p className="rtc-subtitle">{subtitle}</p>
      </div>

      <div className="rtc-topbar__right">
        <div className="rtc-field">
          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            value={props.displayName}
            onChange={(e) => props.onChangeDisplayName(e.target.value)}
            placeholder="e.g. Osama"
            autoComplete="off"
          />
        </div>

        <div className="rtc-field">
          <label htmlFor="roomId">Room</label>
          <input
            id="roomId"
            value={props.roomId}
            onChange={(e) => props.onChangeRoomId(e.target.value)}
            placeholder="room id"
            autoComplete="off"
          />
        </div>

        <div className="rtc-actions">
          <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onShowTip}>
            Show tip
          </button>
          <button type="button" className="rtc-btn rtc-btn--danger" onClick={props.onClear}>
            Clear
          </button>
          <button type="button" className="rtc-btn" onClick={props.onCreateRoom}>
            Create room
          </button>
          <button type="button" className="rtc-btn" onClick={props.onJoinRoom}>
            Join room
          </button>
          <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onCopyLink}>
            Copy link
          </button>
          <button type="button" className="rtc-btn rtc-btn--danger" onClick={props.onLeaveOrEnd}>
            Leave / End
          </button>
        </div>

        <button
          type="button"
          className="rtc-btn rtc-btn--ghost"
          onClick={() => props.addLog('info', 'Open two tabs and practice offer/answer + ICE, or use Firestore rooms.')}
          style={{ display: 'none' }}
        >
          Hidden debug
        </button>
      </div>
    </header>
  );
}
