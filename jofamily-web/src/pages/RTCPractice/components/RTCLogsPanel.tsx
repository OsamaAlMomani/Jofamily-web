type Props = {
  logText: string;
  onClearLogs: () => void;
  onCopyLogs: () => void;
};

export function RTCLogsPanel(props: Props) {
  return (
    <section className="rtc-card rtc-logs">
      <div className="rtc-card__header">
        <h2>Logs</h2>
        <p>Use logs while wiring events.</p>
      </div>

      <div className="rtc-logActions">
        <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onClearLogs}>
          Clear logs
        </button>
        <button type="button" className="rtc-btn rtc-btn--ghost" onClick={props.onCopyLogs}>
          Copy logs
        </button>
      </div>

      <pre className="rtc-log" aria-label="Logs">
        {props.logText || 'No logs yet.'}
      </pre>
    </section>
  );
}
