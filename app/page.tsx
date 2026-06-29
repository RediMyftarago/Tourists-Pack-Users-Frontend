import Header from "../components/Header";
import Footer from "../components/Footer";
import { ActivationStep } from "@/components/ActivationStep";
import LoginModal from "@/components/LoginMod";
import DiscountRoulette from "@/components/DiscountRoulette";
import HeroExperience from "@/components/HeroExperience";
import PackRevealCard from "@/components/PackRevealCard";
import TouristPromoBanner from "@/components/TouristPromoBanner";
import { getActiveOffers } from "@/lib/offers/api";

export const dynamic = "force-dynamic";

const activationSteps = [
  {
    number: "1",
    title: "Choose Pack",
    text: "Select the tourist pack that fits your needs",
  },
  {
    number: "2",
    title: "Click Activate",
    text: "Press the activate button on your chosen pack",
  },
  {
    number: "3",
    title: "Start Using",
    text: "Your pack is ready to use immediately",
  },
];

export default async function HomePage() {
  const offers = await getActiveOffers();

  return (
    <>
    <LoginModal/>
    <DiscountRoulette />
    <div className="page">
      <Header />
      <main className="main">
        <HeroExperience />

        {/* Packs Section */}
        <section id="tourist-packs">
          <h2 className="section-title">Tourist Packs</h2>
          <div className="pack-grid">
            {offers.map((pack) => (
              <PackRevealCard
                key={pack.id}
                title={pack.title}
                subtitle={pack.subtitle}
                price={pack.price}
                duration={pack.duration}
                features={pack.features}
              />
            ))}
          </div>
          {offers.length === 0 && (
            <div className="offers-empty-state">
              <strong>No active tourist offers found</strong>
            </div>
          )}
        </section>

        {/* How to Activate Section */}
        <h2 className="section-title" id="how-to-activate">How to Activate</h2>
        <div className="steps">
          {activationSteps.map((step, index) => (
            <ActivationStep
              key={index}
              number={step.number}
              title={step.title}
              text={step.text}
            />
          ))}
        </div>

        <TouristPromoBanner />
      </main>

      <Footer />
    </div>
    </>
  );
}
