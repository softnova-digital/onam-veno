"use client";

import { useEffect, useState } from "react";
import ResultBars from "@/components/ResultBars";

const REFRESH_MS = 10000;

/** Public board. Shows counts and turnout, never who voted for what. */
export default function ResultsBoard({ initial }) {
  const [data, setData] = useState(initial);

  // Keep it fresh so it can sit on a laptop or projector.
  useEffect(() => {
    const load = () =>
      fetch("/api/results")
        .then((r) => r.json())
        .then((body) => body.ok && setData(body))
        .catch(() => {});

    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const leader = data.rows[0];
  const decided = data.total > 0 && (!data.rows[1] || data.rows[1].count < leader.count);

  return (
    <>
      <section className="panel headline">
        <p className="headline__q ml">{data.malayalamQuestion}</p>
        <p className="headline__en">{data.question}</p>

        {data.total === 0 ? (
          <p className="headline__answer headline__answer--none">No votes yet</p>
        ) : (
          <p className="headline__answer">
            <span className="ml">{decided ? leader.malayalamLabel : "സമനില"}</span>
            <span className="headline__sub">
              {decided ? `${leader.label} · leading with ${leader.percent}%` : "It is a tie"}
            </span>
          </p>
        )}
      </section>

      <section className="panel">
        <ResultBars rows={data.rows} total={data.total} memberCount={data.memberCount} />
      </section>

      <p className="hint" style={{ textAlign: "center" }}>
        Updates every 10 seconds. Who voted for what stays private.
      </p>
    </>
  );
}
