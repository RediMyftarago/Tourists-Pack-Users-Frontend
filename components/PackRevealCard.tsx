"use client";

import { useState } from "react";
import PackCard from "./PackCard";

type PackRevealCardProps = {
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  features: string[];
};

export default function PackRevealCard(props: PackRevealCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`pack-reveal ${revealed ? "revealed" : ""}`}>
      {!revealed && (
        <button
          type="button"
          className="pack-cover"
          onClick={() => setRevealed(true)}
          aria-label={`Reveal ${props.title}`}
        >
          <span className="pack-cover-orbit" />
          <span className="pack-cover-badge">Tourist Pack</span>
          <strong>{props.title}</strong>
          <small>{props.duration} connectivity</small>
          <span className="pack-cover-action">Tap to reveal</span>
        </button>
      )}

      <div className="pack-reveal-content">
        <PackCard {...props} />
      </div>
    </div>
  );
}
