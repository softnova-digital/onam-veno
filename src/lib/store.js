import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { normalizeName } from "@/config/event";

// Votes live in a plain JSON file at <project>/data/votes.json.
// No database, no signup, survives restarts. Swap this file for a real DB
// later and the rest of the app does not change.
const DATA_DIR = path.join(process.cwd(), "data");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");

const EMPTY = { votes: [] };

// Every write goes through this chain so two people tapping Vote at the
// same instant cannot clobber each other's line in the file.
let queue = Promise.resolve();
function serialize(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function readFileSafe() {
  try {
    const raw = await fs.readFile(VOTES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.votes) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

async function writeFileSafe(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${VOTES_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, VOTES_FILE);
}

export async function getAllVotes() {
  return (await readFileSafe()).votes;
}

export async function getVotesFor(pollId) {
  const votes = await getAllVotes();
  return votes.filter((v) => v.pollId === pollId);
}

export async function findVote(voter, pollId) {
  const key = normalizeName(voter);
  const votes = await getAllVotes();
  return votes.find((v) => v.voterKey === key && v.pollId === pollId) || null;
}

/** Records a vote. Returns { ok } or { ok: false, reason: "duplicate", vote }. */
export async function recordVote({ voter, pollId, optionId }) {
  return serialize(async () => {
    const data = await readFileSafe();
    const key = normalizeName(voter);
    const existing = data.votes.find((v) => v.voterKey === key && v.pollId === pollId);
    if (existing) return { ok: false, reason: "duplicate", vote: existing };

    const vote = {
      id: crypto.randomUUID(),
      voter: String(voter).trim(),
      voterKey: key,
      pollId,
      optionId,
      at: new Date().toISOString(),
    };
    data.votes.push(vote);
    await writeFileSafe(data);
    return { ok: true, vote };
  });
}

/**
 * The public counts: how many chose each option, highest first.
 * Deliberately contains no voter names - anyone may see this.
 */
export async function tally(poll) {
  const votes = await getVotesFor(poll.id);
  const counts = new Map();
  for (const v of votes) counts.set(v.optionId, (counts.get(v.optionId) || 0) + 1);

  const total = votes.length;
  const rows = poll.options
    .map((o) => {
      const count = counts.get(o.id) || 0;
      return { ...o, count, percent: total ? Math.round((count / total) * 100) : 0 };
    })
    .sort((a, b) => b.count - a.count);

  return { pollId: poll.id, total, rows };
}

/**
 * Who voted, and what they chose. Organisers only - never send this to the
 * public results page.
 */
export async function voterLog(poll, members) {
  const votes = await getVotesFor(poll.id);
  const labelOf = new Map(poll.options.map((o) => [o.id, o]));

  const voted = votes
    .map((v) => {
      const option = labelOf.get(v.optionId);
      return {
        voter: v.voter,
        optionId: v.optionId,
        optionLabel: option?.label ?? v.optionId,
        optionMalayalam: option?.malayalamLabel ?? "",
        optionEmoji: option?.emoji ?? "",
        optionTone: option?.tone ?? "",
        at: v.at,
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));

  const votedKeys = new Set(votes.map((v) => v.voterKey));
  const pending = members.filter((m) => !votedKeys.has(normalizeName(m)));

  return { voted, pending };
}

/** Clears votes for one poll, or everything when pollId is omitted. */
export async function clearVotes(pollId) {
  return serialize(async () => {
    const data = await readFileSafe();
    const before = data.votes.length;
    data.votes = pollId ? data.votes.filter((v) => v.pollId !== pollId) : [];
    await writeFileSafe(data);
    return { removed: before - data.votes.length };
  });
}
