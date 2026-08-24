"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaveliVideo from "@/components/MaveliVideo";
import Burst from "@/components/Burst";
import ResultBars from "@/components/ResultBars";

// Remembering the vote on the device means a refresh does not offer a second
// ballot. The server is still the real guard - this is only a courtesy.
const storageKey = (pollId) => `onam-veno:v1:${pollId}`;

function readReceipt(pollId) {
  try {
    const raw = window.localStorage.getItem(storageKey(pollId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveReceipt(pollId, receipt) {
  try {
    window.localStorage.setItem(storageKey(pollId), JSON.stringify(receipt));
  } catch {
    /* private browsing - the server still has the vote */
  }
}

function clearReceipt(pollId) {
  try {
    window.localStorage.removeItem(storageKey(pollId));
  } catch {
    /* nothing to do */
  }
}

export default function VoteBooth({ poll, members }) {
  const [name, setName] = useState("");
  const [choice, setChoice] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // localStorage only exists in the browser, so this runs after mount. The
  // ballot is what renders on the server, so the page is never blank while
  // JS loads - a voter who already voted just sees it swap to their receipt.
  useEffect(() => {
    const saved = readReceipt(poll.id);
    if (saved) setReceipt(saved);
  }, [poll.id]);

  async function submit(e) {
    e.preventDefault();

    if (!name) return setError("Please pick your name from the list.");
    if (!choice) return setError("Pick an answer before voting.");

    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter: name, pollId: poll.id, optionId: choice }),
      });
      const data = await res.json();

      if (res.ok || data.reason === "duplicate") {
        const done = {
          voter: data.voter ?? name,
          optionId: data.optionId,
          optionLabel: data.optionLabel,
          optionMalayalam: data.optionMalayalam,
          already: data.reason === "duplicate",
        };
        saveReceipt(poll.id, done);
        setReceipt(done);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.message || "Could not save your vote. Please try again.");
      }
    } catch {
      setError("No connection to the server. Check the wifi and try again.");
    } finally {
      setSending(false);
    }
  }

  function voteAsSomeoneElse() {
    clearReceipt(poll.id);
    setReceipt(null);
    setName("");
    setChoice(null);
    setError("");
  }

  if (receipt) {
    return <ThankYou receipt={receipt} onVoteAsSomeoneElse={voteAsSomeoneElse} />;
  }

  return (
    <form className="ballot" onSubmit={submit} noValidate>
      <section className="step">
        <h2 className="step__label">
          <span className="step__num">1</span> Your name
        </h2>
        <select
          className="field"
          aria-label="Your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
        >
          <option value="">Pick your name...</option>
          {members.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <p className="hint">Only people on the list can vote, once each.</p>
      </section>

      <section className="step">
        <h2 className="step__label">
          <span className="step__num">2</span> Your answer
        </h2>

        <div className="question">
          <p className="question__ml ml">{poll.malayalamQuestion}</p>
          <p className="question__en">{poll.question}</p>
        </div>

        <fieldset className="choices">
          <legend className="sr-only">{poll.question}</legend>
          {poll.options.map((option, i) => (
            <Choice
              key={option.id}
              option={option}
              index={i}
              checked={choice === option.id}
              onSelect={() => {
                setChoice(option.id);
                if (error) setError("");
              }}
            />
          ))}
        </fieldset>
      </section>

      <div className="votebar">
        <div className="votebar__inner">
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Sending your vote..." : "Vote"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Choice({ option, index, checked, onSelect }) {
  return (
    <label
      className="choice"
      data-on={checked}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <input
        className="sr-only"
        type="radio"
        name="answer"
        value={option.id}
        checked={checked}
        onChange={onSelect}
      />
      <span className="choice__emoji" aria-hidden="true">{option.emoji}</span>
      <span className="choice__ml ml">{option.malayalamLabel}</span>
      <span className="choice__en">{option.label}</span>
      {option.tagline && <span className="choice__tag">{option.tagline}</span>}
      <span className="choice__tick" aria-hidden="true">✓</span>
    </label>
  );
}

function ThankYou({ receipt, onVoteAsSomeoneElse }) {
  const [result, setResult] = useState(null);

  // Everyone is allowed to see the running counts, so show them right here.
  useEffect(() => {
    let live = true;
    fetch("/api/results")
      .then((r) => r.json())
      .then((data) => live && data.ok && setResult(data))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="done">
      <div className="done__hero">
        <Burst />
        <MaveliVideo className="done__clip" />
      </div>

      <h2 className="done__ml ml">ഓണാശംസകൾ!</h2>
      <p className="done__title display">
        {receipt.already ? "You already voted" : "Your vote is in"}
      </p>
      <p className="done__body">
        {receipt.already
          ? "One vote each - here is what we have on record for you."
          : "Thanks for voting. Maveli has noted it down."}
      </p>

      <div className="receipt">
        <p className="receipt__label">Voter</p>
        <p className="receipt__value">{receipt.voter}</p>
        <hr />
        <p className="receipt__label">Your answer</p>
        <p className="receipt__value receipt__value--big">
          <span className="ml">{receipt.optionMalayalam}</span>
          {receipt.optionLabel && <span className="receipt__en"> {receipt.optionLabel}</span>}
        </p>
      </div>

      {result && (
        <div className="receipt receipt--result">
          <p className="receipt__label">Where it stands</p>
          <ResultBars
            rows={result.rows}
            total={result.total}
            memberCount={result.memberCount}
            compact
          />
        </div>
      )}

      <p className="done__links">
        <Link href="/results">See the full result</Link>
      </p>

      <button type="button" className="linkish" onClick={onVoteAsSomeoneElse}>
        Not you? Vote as someone else
      </button>
    </section>
  );
}
