import { event, getPoll } from "@/config/event";
import { tally } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Public. Anyone may see the counts and the turnout.
 *
 * This response must never contain voter names - who voted for what is
 * organisers-only and lives behind the passcode in /api/admin.
 */
export async function GET() {
  const poll = getPoll();
  const counts = await tally(poll);

  return Response.json({
    ok: true,
    question: poll.question,
    malayalamQuestion: poll.malayalamQuestion,
    ...counts,
    memberCount: event.members.length,
  });
}
