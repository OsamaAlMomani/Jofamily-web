type Props = {
  offerSdp: string;
  answerSdp: string;
  localCandidates: string;
  remoteCandidates: string;

  onChangeOfferSdp: (value: string) => void;
  onChangeAnswerSdp: (value: string) => void;
  onChangeLocalCandidates: (value: string) => void;
  onChangeRemoteCandidates: (value: string) => void;

  onCopy: (text: string, label: string) => void | Promise<void>;

  onCreateOffer: () => void;
  onCreateAnswerFromOffer: () => void;
  onApplyAnswer: () => void;
  onApplyRemoteIceCandidates: () => void;

  onShowGatherTip: () => void;

  onHangup: () => void;
  isPeerConnected: boolean;
};

export function RTCSignalingWorkbench(props: Props) {
  return (
    <section className="rtc-card rtc-signaling">
      <div className="rtc-card__header">
        <h2>Signaling Workbench</h2>
        <p>Use this area to practice offer/answer + ICE copy/paste or Firestore signaling.</p>
      </div>

      <div className="rtc-signalingGrid">
        <div className="rtc-panel">
          <div className="rtc-panel__title">
            <h3>Offer (SDP)</h3>
            <div className="rtc-panel__actions">
              <button
                type="button"
                className="rtc-btn rtc-btn--ghost"
                onClick={() => props.onCopy(props.offerSdp, 'offer')}
                disabled={!props.offerSdp.trim()}
              >
                Copy
              </button>
              <button type="button" className="rtc-btn" onClick={props.onCreateOffer}>
                Create
              </button>
            </div>
          </div>
          <textarea
            className="rtc-textarea"
            value={props.offerSdp}
            onChange={(e) => props.onChangeOfferSdp(e.target.value)}
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
                onClick={() => props.onCopy(props.answerSdp, 'answer')}
                disabled={!props.answerSdp.trim()}
              >
                Copy
              </button>
              <button
                type="button"
                className="rtc-btn"
                onClick={props.onCreateAnswerFromOffer}
                disabled={!props.offerSdp.trim()}
              >
                Create
              </button>
              <button
                type="button"
                className="rtc-btn rtc-btn--ghost"
                onClick={props.onApplyAnswer}
                disabled={!props.answerSdp.trim()}
              >
                Apply
              </button>
            </div>
          </div>
          <textarea
            className="rtc-textarea"
            value={props.answerSdp}
            onChange={(e) => props.onChangeAnswerSdp(e.target.value)}
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
                onClick={() => props.onCopy(props.localCandidates, 'local candidates')}
                disabled={!props.localCandidates.trim()}
              >
                Copy
              </button>
              <button type="button" className="rtc-btn" onClick={props.onShowGatherTip}>
                Gather
              </button>
            </div>
          </div>
          <textarea
            className="rtc-textarea"
            value={props.localCandidates}
            onChange={(e) => props.onChangeLocalCandidates(e.target.value)}
            placeholder="Each candidate on its own line (JSON per line)"
          />
        </div>

        <div className="rtc-panel">
          <div className="rtc-panel__title">
            <h3>Remote ICE Candidates</h3>
            <div className="rtc-panel__actions">
              <button
                type="button"
                className="rtc-btn"
                onClick={props.onApplyRemoteIceCandidates}
                disabled={!props.remoteCandidates.trim()}
              >
                Apply
              </button>
            </div>
          </div>
          <textarea
            className="rtc-textarea"
            value={props.remoteCandidates}
            onChange={(e) => props.onChangeRemoteCandidates(e.target.value)}
            placeholder="Paste remote candidates here"
          />
        </div>
      </div>

      <div className="rtc-steps">
        <h3>Suggested practice flow</h3>
        <ol>
          <li>Open this page in two tabs (A and B).</li>
          <li>On A: Start camera/mic → Create Offer → copy Offer → paste into B.</li>
          <li>On B: Paste Offer → Create Answer → copy Answer → paste into A → Apply Answer.</li>
          <li>Copy/paste ICE candidates both ways, then Apply Remote ICE Candidates.</li>
        </ol>
        <div className="rtc-toolbar" style={{ padding: 0 }}>
          <button type="button" className="rtc-btn rtc-btn--danger" onClick={props.onHangup}>
            Hang up (close peer)
          </button>
          <div style={{ alignSelf: 'center', color: 'rgba(255,255,255,0.7)' }}>
            Status: {props.isPeerConnected ? 'connected' : 'not connected'}
          </div>
        </div>
      </div>
    </section>
  );
}
