import ActivationPaymentPage from "./ActivationPaymentPage";

type ActivatePageProps = {
  searchParams?: Promise<{
    title?: string;
    subtitle?: string;
    price?: string;
    duration?: string;
    features?: string;
    couponDiscount?: string;
  }>;
};

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const params = await searchParams;

  return (
    <ActivationPaymentPage
      title={params?.title || "Selected Pack"}
      subtitle={params?.subtitle || "Tourist package"}
      price={params?.price || "-"}
      duration={params?.duration || "-"}
      features={params?.features ? params.features.split("|").filter(Boolean) : []}
      couponDiscount={params?.couponDiscount ? Number(params.couponDiscount) : 0}
    />
  );
}
