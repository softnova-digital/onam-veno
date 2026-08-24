import Pookalam from "@/components/Pookalam";

// The festive layer behind every page: drifting warm light, two slow pookalams
// and falling petals. Fixed position, never interactive, and paused entirely
// under prefers-reduced-motion.
//
// The petal values are a fixed list rather than Math.random() on purpose -
// random values would differ between the server and the browser and React
// would complain about the mismatch.
const PETALS = [
  { left: "4%", size: 13, fall: 17, delay: -2, spin: 5.5, color: "#e8963a" },
  { left: "11%", size: 9, fall: 22, delay: -9, spin: 7, color: "#efb02e" },
  { left: "19%", size: 15, fall: 14, delay: -5, spin: 4.5, color: "#c9453c" },
  { left: "27%", size: 10, fall: 19, delay: -13, spin: 6, color: "#e8963a" },
  { left: "34%", size: 12, fall: 25, delay: -1, spin: 8, color: "#f0c04a" },
  { left: "42%", size: 8, fall: 16, delay: -7, spin: 5, color: "#d8574a" },
  { left: "49%", size: 14, fall: 21, delay: -16, spin: 6.5, color: "#e8963a" },
  { left: "56%", size: 10, fall: 18, delay: -3, spin: 4.8, color: "#efb02e" },
  { left: "63%", size: 12, fall: 24, delay: -11, spin: 7.5, color: "#c9453c" },
  { left: "70%", size: 9, fall: 15, delay: -6, spin: 5.2, color: "#f0c04a" },
  { left: "77%", size: 15, fall: 20, delay: -14, spin: 6.2, color: "#e8963a" },
  { left: "84%", size: 11, fall: 23, delay: -4, spin: 7.2, color: "#d8574a" },
  { left: "91%", size: 13, fall: 17, delay: -10, spin: 5.6, color: "#efb02e" },
  { left: "96%", size: 9, fall: 26, delay: -18, spin: 8.4, color: "#e8963a" },
];

export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__glow backdrop__glow--1" />
      <div className="backdrop__glow backdrop__glow--2" />
      <div className="backdrop__glow backdrop__glow--3" />

      <Pookalam className="backdrop__mandala backdrop__mandala--a" />
      <Pookalam className="backdrop__mandala backdrop__mandala--b" />

      <div className="petals">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{
              left: p.left,
              animationDuration: `${p.fall}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <span
              className="petal__shape"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                animationDuration: `${p.spin}s`,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
