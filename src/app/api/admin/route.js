import { event, getPoll } from "@/config/event";
import { checkPasscode } from "@/lib/admin";
import { tally, voterLog } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Organisers only: who voted, what they chose, and who is still missing. */
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!checkPasscode(body?.passcode)) {
    return Response.json({ ok: false, message: "Wrong passcode." }, { status: 401 });
  }

  const poll = getPoll();
  const counts = await tally(poll);
  const { voted, pending } = await voterLog(poll, event.members);

  return Response.json({
    ok: true,
    ...counts,
    memberCount: event.members.length,
    voted,
    pending,
  });
}
