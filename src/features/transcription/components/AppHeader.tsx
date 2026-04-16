interface AppHeaderProps {
  narrow: boolean;
  workerReady: boolean;
  localRuntime: boolean;
  engineReady: boolean;
  installedModelCount: number;
  totalModelCount: number;
  canInstallApp: boolean;
  onInstallApp: () => Promise<void>;
}

export function AppHeader({
  narrow,
  workerReady,
  localRuntime,
  engineReady,
  installedModelCount,
  totalModelCount,
  canInstallApp,
  onInstallApp
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-column">
        <p className="brand-tag">WhisperDrop</p>
        <h1>Transcribe audio on this device</h1>
        {!narrow ? (
          <p className="brand-copy">
            Local whisper.cpp in the browser - your audio never leaves this machine.
          </p>
        ) : null}
      </div>

      <div className="header-status">
        {narrow ? (
          <div className="status-chip">
            <span className={`status-dot ${engineReady ? "status-dot-green" : ""}`} />
            <span>
              {workerReady ? "Worker ready" : "Worker..."}
              {" · "}
              {localRuntime ? "Runtime ready" : "Runtime..."}
            </span>
          </div>
        ) : (
          <>
            <div className="status-chip">
              <span className={`status-dot ${workerReady ? "status-dot-green" : ""}`} />
              <span>{workerReady ? "Worker online" : "Worker starting"}</span>
            </div>
            <div className="status-chip">
              <span className={`status-dot ${localRuntime ? "status-dot-green" : ""}`} />
              <span>{localRuntime ? "Runtime ready" : "Runtime loading"}</span>
            </div>
          </>
        )}
        <div className="status-chip">
          <span className="status-dot status-dot-green" />
          <span>
            Models {installedModelCount}/{totalModelCount}
          </span>
        </div>
        {canInstallApp ? (
          <button className="ghost-button" type="button" onClick={() => void onInstallApp()}>
            Install app
          </button>
        ) : null}
      </div>
    </header>
  );
}
