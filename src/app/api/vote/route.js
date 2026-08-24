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
    const previous = poll.options.find((o) => o.id === result.vote.optionId);
    return fail(409, "You have already voted.", {
      reason: "duplicate",
      voter: result.vote.voter,
      optionId: result.vote.optionId,
      optionLabel: previous?.label ?? "",
      optionMalayalam: previous?.malayalamLabel ?? "",
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
