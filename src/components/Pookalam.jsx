// A pookalam drawn as concentric rings of petals with rotational symmetry.
// Pure SVG, no images, scales to any size. Edit RINGS to change the flower.

const RINGS = [
  { count: 24, radius: 84, rx: 6, ry: 14, fill: "var(--marigold)" },
  { count: 20, radius: 68, rx: 8, ry: 13, fill: "var(--red)" },
  { count: 16, radius: 53, rx: 9, ry: 12, fill: "var(--saffron)" },
  { count: 12, radius: 39, rx: 9, ry: 12, fill: "var(--green)" },
  { count: 10, radius: 25, rx: 8, ry: 10, fill: "var(--gold)" },
];

function Ring({ count, radius, rx, ry, fill }) {
  const step = 360 / count;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy={-radius}
          rx={rx}
          ry={ry}
          fill={fill}
          transform={`rotate(${step * i})`}
        />
      ))}
    </g>
  );
}

export default function Pookalam({ className, title }) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <circle r="95" fill="var(--surface-2)" />
      <circle r="95" fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.7" />
      {RINGS.map((ring) => (
        <Ring key={ring.radius} {...ring} />
      ))}
      <circle r="13" fill="var(--red-deep)" />
      <circle r="6" fill="var(--saffron)" />
    </svg>
  );
}
