// A one-shot petal burst for the confirmation screen. Sixteen petals thrown
// outward on a fixed set of angles, so the server and the browser agree.
const COLORS = ["#e8963a", "#efb02e", "#c9453c", "#2e7d52", "#f0c04a", "#d8574a"];

const PIECES = Array.from({ length: 16 }, (_, i) => ({
  angle: (360 / 16) * i,
  distance: 90 + (i % 4) * 26,
  size: 8 + (i % 3) * 4,
  delay: (i % 6) * 0.05,
  color: COLORS[i % COLORS.length],
}));

export default function Burst() {
  return (
    <div className="burst" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="burst__piece"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            "--angle": `${p.angle}deg`,
            "--distance": `${p.distance}px`,
          }}
        />
      ))}
    </div>
  );
}
