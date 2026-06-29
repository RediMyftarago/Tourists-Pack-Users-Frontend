import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PaymentSuccessPage() {
  return (
    <div className="page">
      <Header />
      <main className="login-page">
        <section className="login-shell">
          <span className="auth-eyebrow">Payment complete</span>
          <h1>Your tourist pack is being activated</h1>
          <p>Payment was confirmed successfully. Your Vodafone offer will be activated on the selected number.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
