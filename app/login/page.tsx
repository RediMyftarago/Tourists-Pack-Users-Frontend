"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginMod";

export default function LoginPage() {
  return (
    <div className="page">
      <LoginModal />
      <Header />
      <main className="login-page">
        <section className="login-shell">
          <span className="auth-eyebrow">My Vodafone</span>
          <h1>Sign in to continue</h1>
          <p>Access your profile, activated offers, discounts, and tourist pack details.</p>
          <button
            type="button"
            className="modal-login-btn login-page-button"
            onClick={() => window.dispatchEvent(new Event("vodafone-open-auth"))}
          >
            Open login
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
