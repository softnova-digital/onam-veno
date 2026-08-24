import Link from "next/link";
import MaveliPhoto from "@/components/MaveliPhoto";
import VoteBooth from "@/components/VoteBooth";
import { event, getPoll } from "@/config/event";
import { pendingMembers, storageStatus } from "@/lib/store";

// Votes are read and written per request, so never cache this page.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const poll = getPoll();
  const remaining = await pendingMembers(poll, event.members);
  // When storage is not wired up the whole site is unusable, so say why here
  // rather than only behind the organisers' passcode - which is itself likely
  // to be unset on a half-configured deploy.
  const storage = storageStatus();

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
        {!storage.ok && (
          <p className="alert setup" role="alert">
            <strong>Setup needed.</strong> {storage.message}
          </p>
        )}
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
