import Link from "next/link";
import MaveliPhoto from "@/components/MaveliPhoto";
import VoteBooth from "@/components/VoteBooth";
import { event, getPoll } from "@/config/event";
import { pendingMembers } from "@/lib/store";

// Votes are read and written per request, so never cache this page.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const poll = getPoll();
  const remaining = await pendingMembers(poll, event.members);

  return (
    <div className="page page--vote">
      <header className="hero">
        <div className="shell hero__inner">
          <MaveliPhoto className="hero__maveli" />
          <span className="hero__year">Onam {event.year}</span>
          <h1 className="hero__ml ml">{event.malayalamTitle}</h1>
          <p className="hero__title display">{event.title}</p>
          <p className="hero__tagline">{event.tagline}</p>
        </div>
      </header>

      <main className="shell">
        <VoteBooth poll={poll} members={remaining} />
      </main>

      <footer className="foot">
        <div className="shell">
          <p>
            One vote each. <Link href="/results">See the result</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
