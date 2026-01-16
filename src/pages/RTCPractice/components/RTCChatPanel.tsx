type Props = {
  chat: string[];
  dataMessage: string;
  displayName: string;

  onChangeMessage: (value: string) => void;
  onSend: () => void;
};

export function RTCChatPanel(props: Props) {
  return (
    <section className="rtc-card rtc-data">
      <div className="rtc-card__header">
        <h2>Data Channel / Chat</h2>
        <p>UI placeholder for practicing RTCDataChannel later.</p>
      </div>

      <div className="rtc-chat">
        <div className="rtc-chat__list" aria-label="Chat messages">
          {props.chat.length === 0 ? (
            <div className="rtc-chat__empty">No messages yet.</div>
          ) : (
            props.chat.map((m, idx) => (
              <div key={`${idx}-${m}`} className="rtc-chat__msg">
                {m}
              </div>
            ))
          )}
        </div>

        <div className="rtc-chat__composer">
          <input
            value={props.dataMessage}
            onChange={(e) => props.onChangeMessage(e.target.value)}
            placeholder="Type a message (UI only)"
          />
          <button type="button" className="rtc-btn" onClick={props.onSend}>
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
