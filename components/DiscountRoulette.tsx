"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Percent, Sparkles, Ticket, X } from "lucide-react";
import logo from "../public/assets/vodafone-logo.png";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((module) => module.Wheel),
  {
    ssr: false,
    loading: () => <div className="discount-wheel-skeleton">Loading wheel…</div>,
  }
);

const DISCOUNT_KEY = "vodafone-tourist-discount";
const DISCOUNT_COUPONS_KEY = "vodafone-demo-discount-coupons";

const discounts = Array.from({ length: 10 }, (_, index) => ({
  option: `${index + 1}%`,
  style: {
    backgroundColor: index % 2 === 0 ? "#e60000" : "#ffffff",
    textColor: index % 2 === 0 ? "#ffffff" : "#1f1f1f",
    fontWeight: 800,
  },
}));

export default function DiscountRoulette() {
  const [isOpen, setIsOpen] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [discount, setDiscount] = useState<number | null>(null);

  useEffect(() => {
    const savedDiscount = sessionStorage.getItem(DISCOUNT_KEY);

    if (savedDiscount) {
      setDiscount(Number(savedDiscount));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const buttonLabel = useMemo(() => {
    if (discount) {
      return `Your ${discount}% discount`;
    }

    return "Spin for a discount";
  }, [discount]);

  const handleSpin = () => {

    if (mustSpin || discount) return;

    const nextPrize = Math.floor(Math.random() * discounts.length);
    setPrizeNumber(nextPrize);
    setMustSpin(true);
  };

  const handleStop = () => {
    const wonDiscount = prizeNumber + 1;
    const storedCoupons = localStorage.getItem(DISCOUNT_COUPONS_KEY);
    const coupons = storedCoupons ? JSON.parse(storedCoupons) : [];
    const coupon = {
      id: `DISC-${Date.now()}`,
      discount: wonDiscount,
      date: new Date().toISOString(),
      status: "Available",
    };

    setMustSpin(false);
    setDiscount(wonDiscount);
    sessionStorage.setItem(DISCOUNT_KEY, String(wonDiscount));
    localStorage.setItem(DISCOUNT_COUPONS_KEY, JSON.stringify([coupon, ...coupons]));
    window.dispatchEvent(new CustomEvent("vodafone-discount-added", { detail: coupon }));
  };

  return (
    <div className="discount-widget">
      {isOpen && (
          <section
            className="discount-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-title"
          >
            <button
              type="button"
              className="auth-close discount-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close discount roulette"
            >
              <X size={18} />
            </button>

            <div className="discount-brand">
              <Image src={logo} alt="Vodafone Albania" width={34} height={34} />
              <div>
                <span className="auth-eyebrow">Vodafone Albania</span>
                <h2 id="discount-title">Spin for your tourist discount</h2>
              </div>
            </div>

            <p className="discount-copy">
              Spin once and get an instant discount from 1% to 10% on your next
              tourist pack activation.
            </p>

            <div className="discount-wheel-card">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={discounts}
                onStopSpinning={handleStop}
                backgroundColors={["#e60000", "#ffffff"]}
                textColors={["#ffffff", "#1f1f1f"]}
                outerBorderColor="#e60000"
                outerBorderWidth={8}
                innerBorderColor="#ffffff"
                innerBorderWidth={2}
                radiusLineColor="#f4d6d6"
                radiusLineWidth={2}
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize={18}
                fontWeight={800}
                spinDuration={0.45}
                textDistance={62}
                disableInitialAnimation
              />
            </div>

            {discount ? (
              <div className="discount-result" aria-live="polite">
                <Sparkles size={18} />
                <span>
                  Nice — you won <strong>{discount}% off</strong>. Use it on
                  your tourist pack today.
                </span>
              </div>
            ) : (
              <div className="discount-hint" aria-live="polite">
                <Percent size={17} />
                <span>Every user gets one winning spin.</span>
              </div>
            )}

            <button
              type="button"
              className="modal-login-btn discount-spin-button"
              onClick={handleSpin}
              disabled={mustSpin || Boolean(discount)}
            >
              {mustSpin
                ? "Spinning…"
                : discount
                  ? "Discount claimed"
                  : "Spin the wheel"}
            </button>
          </section>
      )}

      <button
        type="button"
        className={`discount-fab ${discount ? "has-discount" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label={buttonLabel}
      >
        <span className="discount-fab-icon">
          <Image src={logo} alt="" width={34} height={34} />
          <span className="discount-fab-badge">
            {discount ? <Ticket size={15} /> : <Percent size={16} />}
          </span>
        </span>
        <span className="discount-fab-text">
          {discount ? `${discount}% off` : "Win discount"}
        </span>
      </button>
    </div>
  );
}
