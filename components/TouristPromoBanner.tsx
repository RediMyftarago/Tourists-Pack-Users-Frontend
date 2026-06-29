"use client";

import { useEffect, useRef, useState } from "react";

export default function TouristPromoBanner() {
  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const interval = window.setInterval(() => {
      setCycle((current) => (current === null ? 0 : (current + 1) % 3));
    }, 3000);

    return () => window.clearInterval(interval);
  }, [started]);

  return (
    <section
      ref={sectionRef}
      className={[
        "tourist-promo-banner",
        started ? "promo-started" : "",
        cycle === null ? "" : `promo-cycle-${cycle}`,
      ].filter(Boolean).join(" ")}
      aria-label="Tourist pack promotion"
    >
      <div className="promo-heading">
        <h2>Experience Albania with Vodafone Tourist eSIM</h2>
        <p>Online tourist packs made for maps, bookings, sharing, and staying reachable from the moment you arrive.</p>
      </div>

      <div className="promo-device-frame">
        <div className="promo-device-notch" />
        <div className="promo-device-screen">
          <div className="promo-copy">
            <span>Vodafone Albania</span>
            <h2>Tourist eSIM ready before you land</h2>
            <p>Activate data, maps, calls, and local support for your Albania trip in minutes.</p>
            <a href="#tourist-packs">Explore packs</a>
          </div>

          <div className="promo-visual-stack" aria-hidden="true">
            <div className="promo-sim-card">
              <span>eSIM</span>
              <strong>5G</strong>
            </div>
            <div className="promo-map-card">
              <span>Tirana</span>
              <span>Vlora</span>
              <span>Theth</span>
            </div>
            <div className="promo-pass-card">
              <span>Tourist Pack</span>
              <strong>Ready online</strong>
            </div>
          </div>

          <div className="promo-badge">5G</div>
          <div className="promo-side-line" />
        </div>
      </div>
    </section>
  );
}
