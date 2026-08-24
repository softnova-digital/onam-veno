// Shared by the public results page and the confirmation screen.
// Counts only - it is never given voter names.
export default function ResultBars({ rows, total, memberCount, compact }) {
  return (
    <div className={compact ? "bars bars--compact" : "bars"}>
      {rows.map((row) => (
        <div className="row" key={row.id} data-tone={row.tone}>
          <div className="row__top">
            <span className="row__name">
              <span className="ml">{row.malayalamLabel}</span>{" "}
              <span className="row__en">{row.label}</span>
            </span>
            <span className="row__count">
              {row.count} · {row.percent}%
            </span>
          </div>
          <div
            className="bar"
            role="meter"
            aria-valuenow={row.count}
            aria-valuemin={0}
            aria-valuemax={total || 1}
            aria-label={`${row.label}: ${row.count} votes`}
          >
            <div className="bar__fill" style={{ width: `${row.percent}%` }} />
          </div>
        </div>
      ))}

      {typeof memberCount === "number" && (
        <p className="turnout">
          <strong>{total}</strong> of {memberCount} {memberCount === 1 ? "person" : "people"}{" "}
          have voted
          {total < memberCount && <> · waiting on {memberCount - total}</>}
        </p>
      )}
    </div>
  );
}
