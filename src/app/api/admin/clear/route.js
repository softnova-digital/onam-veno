import { getPoll } from "@/config/event";
import { checkPasscode } from "@/lib/admin";
import { clearVotes } from "@/lib/store";

export const dynamic = "force-dynamic";

// Used by the "Clear all votes" button, so the real vote starts from zero.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!checkPasscode(body?.passcode)) {
    return Response.json({ ok: false, message: "Wrong passcode." }, { status: 401 });
  }

  const { removed } = await clearVotes(getPoll().id);
  return Response.json({ ok: true, removed });
}
