import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { normalizeName } from "@/config/event";

// ============================================================================
//  Where votes live
//
//  Two backends, picked automatically:
//
//  * Redis, when Upstash / Vercel KV credentials are in the environment.
//    Required on Vercel, where every request gets a fresh, read-only
//    filesystem - a JSON file there saves nothing at all.
//
//  * A JSON file otherwise - at <project>/data/votes.json on your own machine,
//    or /tmp on a serverless host, which is the one writable place there.
//
//  Everything above this file works the same either way.
//
//  A warning about /tmp on Vercel: it is writable, but it is private to one
//  instance of one function. Each route here deploys as its own function, so
//  /api/vote and /api/admin never share a /tmp and votes written by one are
//  invisible to the other. It is a last resort for a single-process host, not
//  a working option on Vercel. Connect Redis (see the README) there.
// ============================================================================

// Different providers inject different names, so accept the usual ones.
const URL_VARS = ["KV_REST_API_URL", "UPSTASH_REDIS_REST_URL", "REDIS_REST_URL"];
const TOKEN_VARS = ["KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN", "REDIS_REST_TOKEN"];

const firstSet = (names) => names.find((n) => process.env[n]);

const REST_URL = process.env[firstSet(URL_VARS) ?? ""] || undefined;
const REST_TOKEN = process.env[firstSet(TOKEN_VARS) ?? ""] || undefined;

const useRedis = Boolean(REST_URL && REST_TOKEN);

/** Serverless hosts give each request a throwaway filesystem. */
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * What the organisers' page shows, so a misconfigured deploy is obvious - and
 * says which credential is missing, since "no database" has several causes.
 * Only variable NAMES are reported here, never their values.
 */
export function storageStatus() {
  if (useRedis) {
    return { backend: "redis", ok: true, message: "Votes are stored in Redis." };
  }

  if (isServerless) {
    return {
      backend: "tmp",
      ok: true,
      message: "Votes are being written to /tmp on this host.",
      warning:
        "Votes are not being counted. Each page and API route here runs as a " +
        "separate function with its own private /tmp, so a vote saved by the " +
        "voting page is invisible to the results and organisers pages. " +
        "Connect Upstash for Redis in Storage and redeploy - it is free and " +
        "the app switches over on its own.",
    };
  }

  return { backend: "file", ok: true, message: "Votes are stored in data/votes.json." };
}

// --- Redis backend ----------------------------------------------------------

const redisKey = (pollId) => `onam:votes:${pollId}`;

async function redis(command) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Redis ${command[0]} failed with HTTP ${res.status}`);
  }

  const body = await res.json();
  if (body.error) throw new Error(`Redis ${command[0]}: ${body.error}`);
  return body.result;
}

// HGETALL comes back over REST as a flat [field, value, field, value, ...].
function parseHash(flat) {
  const out = [];
  if (!Array.isArray(flat)) return out;
  for (let i = 1; i < flat.length; i += 2) {
    try {
      out.push(JSON.parse(flat[i]));
    } catch {
      /* skip an unreadable row rather than losing the whole tally */
    }
  }
  return out;
}

// --- File backend -----------------------------------------------------------

// On a serverless host the deployment directory is read-only; /tmp is the one
// writable path, so the same file backend is aimed there instead.
const DATA_DIR = isServerless ? "/tmp" : path.join(process.cwd(), "data");
const VOTES_FILE = path.join(DATA_DIR, isServerless ? "onam-votes.json" : "votes.json");
const EMPTY = { votes: [] };

// Every write goes through this chain so two people tapping Vote at the same
// instant cannot clobber each other's line in the file.
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

// --- The API the rest of the app uses ---------------------------------------

export async function getVotesFor(pollId) {
  if (useRedis) return parseHash(await redis(["HGETALL", redisKey(pollId)]));
  const { votes } = await readFileSafe();
  return votes.filter((v) => v.pollId === pollId);
}

/** Records a vote. Returns { ok } or { ok: false, reason: "duplicate", vote }. */
export async function recordVote({ voter, pollId, optionId }) {
  const voterKey = normalizeName(voter);
  const vote = {
    id: crypto.randomUUID(),
    voter: String(voter).trim(),
    voterKey,
    pollId,
    optionId,
    at: new Date().toISOString(),
  };

  if (useRedis) {
    // HSETNX writes only when the field is absent, and it is atomic, so two
    // people voting under one name at the same moment cannot both get through
    // even when they land on different instances.
    const written = await redis([
      "HSETNX",
      redisKey(pollId),
      voterKey,
      JSON.stringify(vote),
    ]);

    if (written === 1) return { ok: true, vote };

    const existingRaw = await redis(["HGET", redisKey(pollId), voterKey]);
    let existing = null;
    try {
      existing = existingRaw ? JSON.parse(existingRaw) : null;
    } catch {
      /* fall through to a bare duplicate */
    }
    return { ok: false, reason: "duplicate", vote: existing ?? vote };
  }

  return serialize(async () => {
    const data = await readFileSafe();
    const existing = data.votes.find(
      (v) => v.voterKey === voterKey && v.pollId === pollId
    );
    if (existing) return { ok: false, reason: "duplicate", vote: existing };

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
 * The members who have not voted yet. Deliberately separate from voterLog:
 * the ballot needs the remaining names and must not load anyone's choice.
 */
export async function pendingMembers(poll, members) {
  const votes = await getVotesFor(poll.id);
  const voted = new Set(votes.map((v) => v.voterKey));
  return members.filter((m) => !voted.has(normalizeName(m)));
}

/**
 * Who voted, and what they chose. Organisers only - never send this to the
 * public results page.
 */
export async function voterLog(poll, members) {
  const votes = await getVotesFor(poll.id);
  const optionOf = new Map(poll.options.map((o) => [o.id, o]));

  const voted = votes
    .map((v) => {
      const option = optionOf.get(v.optionId);
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

/** Clears every vote for one poll. */
export async function clearVotes(pollId) {
  if (useRedis) {
    const before = await redis(["HLEN", redisKey(pollId)]);
    await redis(["DEL", redisKey(pollId)]);
    return { removed: Number(before) || 0 };
  }

  return serialize(async () => {
    const data = await readFileSafe();
    const before = data.votes.length;
    data.votes = data.votes.filter((v) => v.pollId !== pollId);
    await writeFileSafe(data);
    return { removed: before - data.votes.length };
  });
}
