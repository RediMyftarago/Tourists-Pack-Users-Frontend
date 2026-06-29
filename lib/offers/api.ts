export type OfferResponse = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
  discountPercentage?: number;
  status?: string;
  popupEnabled?: boolean;
};

const OFFERS_API_URL =
  process.env.OFFERS_API_URL ??
  process.env.NEXT_PUBLIC_OFFERS_API_URL ??
  "http://localhost:8800";

export async function getActiveOffers() {
  try {
    const response = await fetch(`${OFFERS_API_URL}/api/offers/active`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Offers service returned ${response.status}`);
    }

    const offers = await response.json() as OfferResponse[];

    return offers.filter((offer) =>
      offer.title &&
      offer.subtitle &&
      offer.price &&
      offer.duration &&
      Array.isArray(offer.features)
    );
  } catch (error) {
    console.error("Failed to load active offers", error);
    return [];
  }
}
