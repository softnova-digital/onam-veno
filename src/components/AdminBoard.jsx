"use client";

import { useCallback, useEffect, useState } from "react";
import ResultBars from "@/components/ResultBars";

const PASS_KEY = "onam-veno:pass";
const REFRESH_MS = 10000;

/** Organisers only: the per-voter detail behind the passcode. */
export default function AdminBoard() {
  const [passcode, setPasscode] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (code) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: code }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Could not load the detail.");
    return body;
  }, []);

  // Unlock straight away if this tab already has the passcode.
  useEffect(() => {
    const saved = sessionStorage.getItem(PASS_KEY);
    if (!saved) return;
    setPasscode(saved);
    load(saved)
      .then(setData)
      .catch(() => sessionStorage.removeItem(PASS_KEY));
  }, [load]);

  useEffect(() => {
    if (!data) return undefined;
    const id = setInterval(() => {
      load(passcode).then(setData).catch(() => {});
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [data, passcode, load]);

  async function unlock(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = await load(passcode);
      sessionStorage.setItem(PASS_KEY, passcode);
      setData(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    if (!window.confirm("Delete every vote? This cannot be undone.")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      setData(await load(passcode));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <form className="panel" onSubmit={unlock}>
        <h2 className="step__label">
          <span className="step__num">!</span> Organisers only
        </h2>
        <input
          className="field"
          type="password"
          aria-label="Passcode"
          placeholder="Passcode"
          autoComplete="current-password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />
        {error && (
          <p className="alert" role="alert" style={{ marginTop: 12, marginBottom: 0 }}>
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy} style={{ marginTop: 12 }}>
          {busy ? "Checking..." : "Show voter detail"}
        </button>
      </form>
    );
  }

  return (
    <>
      <div className="toolbar">
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => load(passcode).then(setData).catch(() => {})}
        >
          Refresh now
        </button>
        <button className="btn btn--danger" type="button" onClick={clearAll} disabled={busy}>
          Clear all votes
        </button>
      </div>

      {data.storage && !data.storage.ok && (
        <p className="alert" role="alert" style={{ marginBottom: 16 }}>
          {data.storage.message}
        </p>
      )}

      <section className="panel">
        <ResultBars rows={data.rows} total={data.total} memberCount={data.memberCount} />
      </section>

      <section className="panel">
        <h2 className="tally__title display">Who voted ({data.voted.length})</h2>
        {data.voted.length === 0 ? (
          <p className="hint">Nobody has voted yet.</p>
        ) : (
          <ul className="vlist">
            {data.voted.map((v) => (
              <li className="vrow" key={v.voter + v.at}>
                <span className="vrow__name">{v.voter}</span>
                <span className="vrow__choice" data-tone={v.optionTone}>
                  <span aria-hidden="true">{v.optionEmoji}</span>{" "}
                  <span className="ml">{v.optionMalayalam}</span>
                </span>
                <span className="vrow__at">
                  {new Date(v.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="tally__title display">Still to vote ({data.pending.length})</h2>
        {data.pending.length === 0 ? (
          <p className="hint">Everyone has voted.</p>
        ) : (
          <ul className="chips">
            {data.pending.map((m) => (
              <li className="chip" key={m}>
                {m}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
