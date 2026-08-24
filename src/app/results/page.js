import Link from "next/link";
import ResultsBoard from "@/components/ResultsBoard";
import { event, getPoll } from "@/config/event";
import { tally } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: `Result - ${event.title}` };

/** Public page - no passcode. Counts only, never who voted for what. */
export default async function ResultsPage() {
  const poll = getPoll();
  const counts = await tally(poll);

  const initial = {
    ok: true,
    question: poll.question,
    malayalamQuestion: poll.malayalamQuestion,
    ...counts,
    memberCount: event.members.length,
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="shell hero__inner">
          <span className="hero__year">Result</span>
          <p className="hero__title display">{event.title}</p>
        </div>
      </header>

      <main className="shell">
        <ResultsBoard initial={initial} />
      </main>

      <footer className="foot">
        <div className="shell">
          <p>
            <Link href="/">Back to voting</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
