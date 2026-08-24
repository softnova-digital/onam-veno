"use client";

import { useEffect, useRef, useState } from "react";

// The celebration clip on the confirmation screen (public/maveli.mp4).
// It loops silently on its own, except for anyone who has asked their phone
// for less motion - they get the poster frame and a play button instead.
export default function MaveliVideo({ className }) {
  const videoRef = useRef(null);
  const [stillOnly, setStillOnly] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStillOnly(query.matches);

    const onChange = (e) => setStillOnly(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Some browsers refuse the autoplay attribute but allow a muted play() call.
  useEffect(() => {
    if (stillOnly) return;
    videoRef.current?.play().catch(() => {});
  }, [stillOnly]);

  return (
    <div className={`clip${className ? ` ${className}` : ""}`}>
      <video
        ref={videoRef}
        className="clip__video"
        poster="/maveli-poster.webp"
        preload="metadata"
        playsInline
        muted
        loop={!stillOnly}
        autoPlay={!stillOnly}
        controls={stillOnly}
        aria-label="Maveli"
      >
        <source src="/maveli.mp4" type="video/mp4" />
      </video>
      <span className="clip__ring" aria-hidden="true" />
    </div>
  );
}
