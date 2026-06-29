import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PaymentCancelPage() {
  return (
    <div className="page">
      <Header />
      <main className="login-page">
        <section className="login-shell">
          <span className="auth-eyebrow">Payment cancelled</span>
          <h1>No payment was taken</h1>
          <p>You can return to the tourist offers and start checkout again whenever you are ready.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
