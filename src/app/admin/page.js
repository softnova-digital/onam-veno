import Link from "next/link";
import AdminBoard from "@/components/AdminBoard";
import { event } from "@/config/event";

export const dynamic = "force-dynamic";

export const metadata = { title: `Organisers - ${event.title}` };

export default function AdminPage() {
  return (
    <div className="page">
      <header className="hero">
        <div className="shell hero__inner">
          <span className="hero__year">Organisers</span>
          <p className="hero__title display">{event.title}</p>
          <p className="hero__tagline">Who voted, and what they picked.</p>
        </div>
      </header>

      <main className="shell">
        <AdminBoard />
      </main>

      <footer className="foot">
        <div className="shell">
          <p>
            <Link href="/results">Public result</Link> · <Link href="/">Back to voting</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
