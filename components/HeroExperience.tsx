"use client";

import { useEffect, useState } from "react";

const moments = [
  {
    place: "Tirana",
    title: "Land, connect, move.",
    text: "Use maps, rides, messages, and reservations as soon as your pack is active.",
  },
  {
    place: "Saranda",
    title: "Share the coast in real time.",
    text: "Reliable data for photos, video calls, and finding the next beach stop.",
  },
  {
    place: "Theth",
    title: "Stay reachable on the road.",
    text: "Keep your group connected while travelling between cities and mountain routes.",
  },
];

const heroStats = [
  { label: "Activation", value: "Minutes" },
  { label: "Designed for", value: "Tourists" },
  { label: "Support", value: "Local" },
];

export default function HeroExperience() {
  const [activeMoment, setActiveMoment] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveMoment((current) => (current + 1) % moments.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  const moment = moments[activeMoment];

  return (
    <section className="hero-experience" aria-label="Vodafone Albania tourist pack introduction">
      <div className="hero-copy-panel">
        <h1 className="animated-welcome" aria-label="Welcome to Vodafone Albania">
          <span className="welcome-word from-left">Welcome</span>
          <span className="welcome-word from-top">to</span>
          <span className="welcome-word from-right">Vodafone</span>
          <span className="welcome-word from-bottom">Albania</span>
        </h1>
        <p>{moment.text}</p>

        <div className="hero-actions">
          <a href="#tourist-packs" className="hero-primary-action">Choose a pack</a>
          <a href="#how-to-activate" className="hero-secondary-action">How activation works</a>
        </div>

        <div className="hero-stat-row" aria-label="Tourist pack highlights">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual-panel" aria-hidden="true">
        <div className="signal-map">
          <span className="map-route" />
          <span className="map-pin pin-tirana">Tirana</span>
          <span className="map-pin pin-vlora">Vlora</span>
          <span className="map-pin pin-theth">Theth</span>
        </div>

        <div className="phone-preview">
          <div className="phone-topbar">
            <span>Vodafone AL</span>
            <span>5G</span>
          </div>
          <div className="phone-screen">
            <span className="pack-ready">Pack ready</span>
            <strong>{moment.title}</strong>
            <div className="signal-bars">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
