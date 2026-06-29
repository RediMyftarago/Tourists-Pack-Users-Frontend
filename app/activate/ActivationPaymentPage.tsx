"use client";

import { FormEvent, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginMod";
import { SESSION_KEY } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

type ActivationPaymentPageProps = {
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  features: string[];
  couponDiscount: number;
};

type PaymentMethod = "card" | "apple-pay" | "google-pay";

const paymentMethods: Array<{ id: PaymentMethod; label: string }> = [
  { id: "card", label: "Card" },
  { id: "apple-pay", label: "Apple Pay" },
  { id: "google-pay", label: "Google Pay" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800";

export default function ActivationPaymentPage({
  title,
  subtitle,
  price,
  duration,
  features,
  couponDiscount,
}: ActivationPaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayCouponDiscount = Number.isFinite(couponDiscount) ? Math.max(0, couponDiscount) : 0;

  const discountedPrice = useMemo(() => {
    if (!displayCouponDiscount) return price;

    const match = price.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
    if (!match) return price;

    const numericPrice = Number(match[1].replace(",", "."));
    if (!Number.isFinite(numericPrice)) return price;

    const discounted = numericPrice * (1 - displayCouponDiscount / 100);
    const formatted = Number.isInteger(discounted) ? String(discounted) : discounted.toFixed(2);

    return `${formatted}${match[2]}`;
  }, [displayCouponDiscount, price]);

  const paymentPayload = useMemo(() => ({
    offer: {
      title,
      subtitle,
      price,
      couponDiscount: displayCouponDiscount,
      totalAfterCoupon: discountedPrice,
      duration,
      features,
    },
    customer: {
      email: contactEmail,
      phoneNumber,
    },
    payment: {
      method: paymentMethod,
      currency: "EUR",
    },
  }), [contactEmail, discountedPrice, displayCouponDiscount, duration, features, paymentMethod, phoneNumber, price, subtitle, title]);

  const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");

    if (!termsAccepted) {
      setSubmitMessage("Please accept the payment and activation terms before continuing.");
      return;
    }

    if (paymentMethod === "card" && !hasValidCardDetails(cardNumber, cardExpiry, cardCvc, cardholderName)) {
      setSubmitMessage("Please enter valid card details before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      const session = storedSession ? JSON.parse(storedSession) as SessionUser : null;

      if (!session?.id) {
        setSubmitMessage("Please sign in again before starting payment.");
        window.dispatchEvent(new Event("vodafone-open-auth"));
        return;
      }

      const amount = parsePriceToMinorUnits(discountedPrice);
      if (!amount) {
        setSubmitMessage("This offer price could not be prepared for payment.");
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.id,
          productName: paymentPayload.offer.title,
          amount,
          currency: paymentPayload.payment.currency.toLowerCase(),
        }),
      });

      const body = await response.json().catch(() => null) as { checkoutUrl?: string; message?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.message || body?.error || "Payment checkout failed.");
      }

      if (!body?.checkoutUrl) {
        throw new Error("Payment service did not return a checkout URL.");
      }

      window.location.href = body.checkoutUrl;
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Payment checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <LoginModal />
      <Header />

      <main className="activation-page checkout-page">
        <section className="checkout-heading">
          <span className="auth-eyebrow">Activation checkout</span>
          <h1>Complete your tourist pack activation</h1>
          <p>Pay securely, then the selected offer will be activated on your Vodafone number.</p>
        </section>

        <section className="checkout-layout">
          <aside className="checkout-summary">
            <div>
              <span className="auth-eyebrow">Selected offer</span>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            <div className="checkout-total">
              <span>Total today</span>
              <strong>{discountedPrice}</strong>
              {displayCouponDiscount > 0 && (
                <em>{displayCouponDiscount}% roulette coupon applied</em>
              )}
              <small>{duration}</small>
            </div>

            <ul className="activation-features">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </aside>

          <form className="checkout-card" onSubmit={handlePayment}>
            <div className="checkout-card-header">
              <h2>Payment details</h2>
              <span>Secure checkout</span>
            </div>

            <fieldset className="payment-method-selector">
              <legend>Payment method</legend>
              <div>
                {paymentMethods.map((method) => (
                  <label key={method.id} className={paymentMethod === method.id ? "selected" : ""}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {paymentMethod === "card" ? (
              <div className="card-details-grid">
                <strong>Card details</strong>
                <label className="wide-card-field">
                  Cardholder name
                  <input
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    placeholder="Name on card"
                    autoComplete="cc-name"
                    required={paymentMethod === "card"}
                  />
                </label>
                <label className="wide-card-field">
                  Card number
                  <input
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                    required={paymentMethod === "card"}
                  />
                </label>
                <label>
                  Expiry
                  <input
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    required={paymentMethod === "card"}
                  />
                </label>
                <label>
                  CVC
                  <input
                    value={cardCvc}
                    onChange={(event) => setCardCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    required={paymentMethod === "card"}
                  />
                </label>
              </div>
            ) : (
              <div className="wallet-payment-box">
                <strong>{paymentMethod === "apple-pay" ? "Apple Pay" : "Google Pay"}</strong>
              </div>
            )}

            <div className="checkout-field-grid">
              <label>
                Vodafone number
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="+355 69 123 4567"
                  required
                />
              </label>
              <label>
                Receipt email
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </label>
            </div>

            <label className="checkout-terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              I agree to pay {discountedPrice} and activate this offer on the selected Vodafone number.
            </label>

            {submitMessage && <p className="checkout-message" role="status">{submitMessage}</p>}

            <button type="submit" className="pack-button checkout-pay-button" disabled={isSubmitting}>
              {isSubmitting ? "Preparing secure payment..." : `Pay ${discountedPrice} and activate`}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function hasValidCardDetails(cardNumber: string, expiry: string, cvc: string, cardholderName: string) {
  const digits = cardNumber.replace(/\D/g, "");
  const [monthText, yearText] = expiry.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  return (
    cardholderName.trim().length >= 2 &&
    digits.length >= 12 &&
    month >= 1 &&
    month <= 12 &&
    Number.isFinite(year) &&
    yearText?.length === 2 &&
    /^\d{3,4}$/.test(cvc)
  );
}

function parsePriceToMinorUnits(price: string) {
  const match = price.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const numericPrice = Number(match[1].replace(",", "."));
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return null;

  return Math.round(numericPrice * 100);
}
