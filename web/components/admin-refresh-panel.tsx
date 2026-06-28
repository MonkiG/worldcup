"use client";

import { useEffect, useState } from "react";

type RefreshResult = {
  error?: string;
  finishedAt?: string;
  fixtures?: number;
  generatedAt?: string;
  groups?: number;
  mode?: string;
  ok?: boolean;
  results?: number;
  startedAt?: string;
};

type RefreshMode = "refresh" | "snapshot";

function formatDate(value?: string) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function AdminRefreshPanel() {
  const [secret, setSecret] = useState("");
  const [rememberSecret, setRememberSecret] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [result, setResult] = useState<RefreshResult | null>(null);

  useEffect(() => {
    const savedSecret = window.localStorage.getItem("worldCupRefreshSecret");
    if (savedSecret) {
      setSecret(savedSecret);
      setRememberSecret(true);
    }
  }, []);

  async function runRefresh(mode: RefreshMode) {
    setIsRefreshing(true);
    setResult(null);

    if (rememberSecret) {
      window.localStorage.setItem("worldCupRefreshSecret", secret);
    } else {
      window.localStorage.removeItem("worldCupRefreshSecret");
    }

    try {
      const response = await fetch(
        `/api/admin/refresh${mode === "snapshot" ? "?mode=snapshot" : ""}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${secret}`,
          },
        },
      );
      const payload = (await response.json()) as RefreshResult;

      setResult(
        response.ok
          ? payload
          : { error: payload.error ?? `Request failed with ${response.status}` },
      );
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Refresh failed",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__controls">
        <label>
          <span>Refresh secret</span>
          <input
            autoComplete="off"
            onChange={(event) => setSecret(event.target.value)}
            placeholder="WORLD_CUP_REFRESH_SECRET"
            type="password"
            value={secret}
          />
        </label>

        <label className="admin-panel__remember">
          <input
            checked={rememberSecret}
            onChange={(event) => setRememberSecret(event.target.checked)}
            type="checkbox"
          />
          <span>Remember locally</span>
        </label>

        <div className="admin-panel__actions">
          <button
            disabled={!secret || isRefreshing}
            onClick={() => runRefresh("refresh")}
            type="button"
          >
            {isRefreshing ? "Refreshing" : "Refresh all data"}
          </button>
          <button
            disabled={!secret || isRefreshing}
            onClick={() => runRefresh("snapshot")}
            type="button"
          >
            Rebuild snapshot
          </button>
        </div>
      </div>

      <div className="admin-panel__result">
        {!result ? (
          <p>Ready for a manual refresh.</p>
        ) : result.error ? (
          <p className="admin-panel__error">{result.error}</p>
        ) : (
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{result.ok ? "Completed" : "Unknown"}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{result.mode}</dd>
            </div>
            <div>
              <dt>Generated</dt>
              <dd>{formatDate(result.generatedAt)}</dd>
            </div>
            <div>
              <dt>Fixtures</dt>
              <dd>{result.fixtures}</dd>
            </div>
            <div>
              <dt>Groups</dt>
              <dd>{result.groups}</dd>
            </div>
            <div>
              <dt>Results</dt>
              <dd>{result.results}</dd>
            </div>
            <div>
              <dt>Finished</dt>
              <dd>{formatDate(result.finishedAt)}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
