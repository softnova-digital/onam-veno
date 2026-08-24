import { event, findMember, getPoll } from "@/config/event";
import { recordVote, tally } from "@/lib/store";

export const dynamic = "force-dynamic";

const fail = (status, message, extra = {}) =>
  Response.json({ ok: false, message, ...extra }, { status });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Malformed request.");
  }

  const poll = getPoll();
  const { voter, pollId, optionId } = body ?? {};

  // Only people on the member list may vote, and we store the roster
  // spelling rather than whatever casing arrived.
  const member = findMember(voter);
  if (!member) return fail(403, "Please pick your name from the list.");

  if (pollId !== poll.id) {
    return fail(409, "This vote has closed. Please refresh the page.");
  }

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) return fail(400, "Pick an answer before voting.");

  const result = await recordVote({ voter: member, pollId: poll.id, optionId: option.id });

  if (!result.ok && result.reason === "duplicate") {
    // Only that this name is used - never which answer it picked. Anyone can
    // select any name here, so returning the choice would hand out exactly the
    // detail that is meant to stay behind the organisers' passcode. The voter
    // themselves still sees their own answer from the receipt on their device.
    return fail(409, "That name has already voted.", {
      reason: "duplicate",
      voter: result.vote.voter,
    });
  }

  // Hand back the fresh counts so the confirmation screen can show the
  // running result straight away, with no second request.
  const counts = await tally(poll);
  return Response.json({
    ok: true,
    voter: member,
    optionId: option.id,
    optionLabel: option.label,
    optionMalayalam: option.malayalamLabel,
    result: { ...counts, memberCount: event.members.length },
  });
}
