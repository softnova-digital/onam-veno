// Maveli (King Mahabali), drawn entirely in SVG so there are no image files
// to ship and he stays sharp at any size. The animation lives in globals.css
// under the .mv-* classes, and every bit of it is switched off by
// prefers-reduced-motion.

// `uid` must differ between instances: SVG gradient ids are document-global,
// so two Maveli sharing them would both resolve to whichever comes first -
// and if that one is hidden, the other loses all its gradient fills.
export default function Maveli({ className, celebrate, uid = "mv" }) {
  const ids = {
    skin: `${uid}-skin`,
    gold: `${uid}-gold`,
    mundu: `${uid}-mundu`,
    pole: `${uid}-pole`,
    glow: `${uid}-glow`,
  };

  return (
    <svg
      viewBox="0 0 300 300"
      className={`maveli${celebrate ? " maveli--celebrate" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label="Maveli"
      focusable="false"
    >
      <defs>
        <linearGradient id={ids.skin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6ad72" />
          <stop offset="100%" stopColor="#c4823f" />
        </linearGradient>
        <linearGradient id={ids.gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd964" />
          <stop offset="45%" stopColor="#e8b53a" />
          <stop offset="100%" stopColor="#b8891f" />
        </linearGradient>
        <linearGradient id={ids.mundu} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="100%" stopColor="#f0e4cd" />
        </linearGradient>
        <linearGradient id={ids.pole} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9702f" />
          <stop offset="50%" stopColor="#d2a054" />
          <stop offset="100%" stopColor="#8d5722" />
        </linearGradient>
        <radialGradient id={ids.glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcf5c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffcf5c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* warm halo behind him */}
      <ellipse className="mv-glow" cx="128" cy="168" rx="136" ry="132" fill={`url(#${ids.glow})`} />

      {/* --- muthukuda, the ceremonial umbrella --- */}
      <g className="mv-umbrella">
        <rect x="187" y="48" width="5.5" height="180" rx="2.75" fill={`url(#${ids.pole})`} />
        <path d="M105 52 Q190 -20 275 52 Z" fill="#b3312c" />
        <path d="M128 52 Q190 4 252 52 Z" fill="#efb02e" />
        <path d="M150 52 Q190 26 230 52 Z" fill="#2e7d52" />
        <path
          d="M105 52 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0 q10.6 14 21.25 0"
          fill="#8f2723"
        />
        <line x1="190" y1="16" x2="190" y2="5" stroke={`url(#${ids.gold})`} strokeWidth="3" />
        <circle cx="190" cy="3" r="5.5" fill={`url(#${ids.gold})`} />
        <circle className="mv-sparkle" cx="190" cy="3" r="2.2" fill="#fff6d6" />
      </g>

      {/* --- body --- */}
      <g className="mv-body">
        <rect x="84" y="146" width="22" height="16" fill="#c4823f" />
        <path
          d="M60 172 Q95 156 130 172 Q153 191 149 217 Q141 252 95 252 Q49 252 41 217 Q37 191 60 172 Z"
          fill={`url(#${ids.skin})`}
        />

        {/* mundu with its kasavu border */}
        <path d="M44 238 Q95 228 146 238 L157 292 Q95 302 33 292 Z" fill={`url(#${ids.mundu})`} />
        <path d="M35 279 Q95 289 155 279 L157 292 Q95 302 33 292 Z" fill={`url(#${ids.gold})`} />
        <path d="M95 234 L95 298" stroke="#e2cfa4" strokeWidth="2" />

        {/* sacred thread and necklaces */}
        <path d="M74 172 L114 234" stroke="#fffaf0" strokeWidth="2.5" opacity="0.85" fill="none" />
        <path d="M78 170 Q95 185 112 170" stroke={`url(#${ids.gold})`} strokeWidth="3" fill="none" />
        <path d="M71 175 Q95 199 119 175" stroke={`url(#${ids.gold})`} strokeWidth="4" fill="none" />
        <circle cx="95" cy="196" r="6.5" fill="#b3312c" />
        <circle cx="95" cy="196" r="2.5" fill="#ffd964" />
        <ellipse cx="95" cy="228" rx="4" ry="3" fill="#a86f33" opacity="0.6" />
      </g>

      {/* --- right arm, holding the umbrella --- */}
      <g className="mv-arm-hold">
        <path
          d="M130 180 Q166 176 188 190"
          stroke={`url(#${ids.skin})`}
          strokeWidth="17"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="190" cy="194" r="11.5" fill="#d9954f" />
      </g>

      {/* --- left arm, waving --- */}
      <g className="mv-arm-wave">
        <path
          d="M60 180 Q42 160 36 138"
          stroke={`url(#${ids.skin})`}
          strokeWidth="17"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="34" cy="130" r="12" fill="#e0a260" />
        <circle cx="30" cy="121" r="3.5" fill="#e0a260" />
        <circle cx="37" cy="118" r="3.5" fill="#e0a260" />
        <circle cx="43" cy="121" r="3.5" fill="#e0a260" />
      </g>

      {/* --- head --- */}
      <g className="mv-head">
        <ellipse cx="55" cy="122" rx="8" ry="11.5" fill="#c4823f" />
        <ellipse cx="135" cy="122" rx="8" ry="11.5" fill="#c4823f" />
        <circle cx="55" cy="137" r="4.5" fill={`url(#${ids.gold})`} />
        <circle cx="135" cy="137" r="4.5" fill={`url(#${ids.gold})`} />

        <circle cx="95" cy="118" r="35" fill={`url(#${ids.skin})`} />

        <circle cx="70" cy="140" r="7.5" fill="#c0553f" opacity="0.28" />
        <circle cx="120" cy="140" r="7.5" fill="#c0553f" opacity="0.28" />

        <path d="M73 101 q9 -6 18 -1" stroke="#2b1a10" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M99 100 q9 -5 18 1" stroke="#2b1a10" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        <ellipse cx="82" cy="114" rx="6.6" ry="7.6" fill="#fffdf8" />
        <ellipse cx="108" cy="114" rx="6.6" ry="7.6" fill="#fffdf8" />
        <circle cx="83" cy="115" r="3.8" fill="#2b1a10" />
        <circle cx="109" cy="115" r="3.8" fill="#2b1a10" />
        <circle cx="84.5" cy="113" r="1.4" fill="#fff" />
        <circle cx="110.5" cy="113" r="1.4" fill="#fff" />
        <ellipse className="mv-lid" cx="82" cy="114" rx="7.1" ry="8.1" fill="#d9954f" />
        <ellipse className="mv-lid" cx="108" cy="114" rx="7.1" ry="8.1" fill="#d9954f" />

        <path d="M95 120 q-5 11 4 13" stroke="#a86f33" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* the moustache, one curl each side */}
        <g className="mv-tache">
          <path d="M95 137 C84 132, 70 134, 68 144 C67 150, 75 151, 77 145 C79 139, 88 138, 95 141 Z" fill="#2b1a10" />
          <path d="M95 137 C106 132, 120 134, 122 144 C123 150, 115 151, 113 145 C111 139, 102 138, 95 141 Z" fill="#2b1a10" />
        </g>
        <path d="M85 150 q10 8 20 0" stroke="#8c4a22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>

      {/* --- crown --- */}
      <g className="mv-crown">
        <path d="M95 32 C117 47, 126 66, 126 83 L64 83 C64 66, 73 47, 95 32 Z" fill={`url(#${ids.gold})`} />
        <rect x="60" y="79" width="70" height="14" rx="6" fill={`url(#${ids.gold})`} />
        <rect x="60" y="79" width="70" height="14" rx="6" fill="#000" opacity="0.06" />
        <circle cx="95" cy="62" r="7.5" fill="#b3312c" />
        <circle className="mv-sparkle" cx="95" cy="62" r="2.6" fill="#ffe9a8" />
        <circle cx="80" cy="74" r="3.6" fill="#2e7d52" />
        <circle cx="110" cy="74" r="3.6" fill="#2e7d52" />
        <circle cx="74" cy="86" r="2.6" fill="#b3312c" />
        <circle cx="95" cy="86" r="2.6" fill="#2e7d52" />
        <circle cx="116" cy="86" r="2.6" fill="#b3312c" />
        <circle cx="95" cy="27" r="5.5" fill={`url(#${ids.gold})`} />
        <circle className="mv-sparkle" cx="95" cy="19" r="3.2" fill="#fff3cd" />
      </g>
    </svg>
  );
}
