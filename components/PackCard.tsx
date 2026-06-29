"use client";

import { useRouter } from "next/navigation";

interface PackCardProps {
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  features: string[];
}

const TRANSACTIONS_KEY = "vodafone-demo-transactions";

export default function PackCard({
  title,
  subtitle,
  price,
  duration,
  features,
}: PackCardProps) {
  const router = useRouter();

  const handleActivate = () => {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    const transactions = stored ? JSON.parse(stored) : [];
    const savedDiscount = sessionStorage.getItem("vodafone-tourist-discount");
    const discount = savedDiscount ? Number(savedDiscount) : 0;

    const transaction = {
      id: `VF-${Date.now()}`,
      title,
      price,
      duration,
      discount,
      status: "Activated",
      date: new Date().toISOString(),
    };

    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([transaction, ...transactions])
    );

    window.dispatchEvent(new CustomEvent("vodafone-transaction-added", { detail: transaction }));

    const params = new URLSearchParams({
      title,
      subtitle,
      price,
      duration,
      features: features.join("|"),
      couponDiscount: String(discount),
    });

    router.push(`/activate?${params.toString()}`);
  };

  return (
    <div className="pack-card bg-white dark:bg-gray-800 text-black dark:text-white">
      {/* Card Header */}
      <div className="pack-header">
        <h3 className="pack-title">{title}</h3>
        <p className="pack-subtitle">{subtitle}</p>
        <div className="pack-price">{price}</div>
        <div className="pack-duration">{duration}</div>
      </div>

      {/* Card Body */}
      <div className="pack-body">
        <ul className="pack-features">
          {features.map((feature, index) => (
            <li key={index} className="pack-feature">
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Card Footer */}
      <div className="pack-footer">
        <button
          className="pack-button"
          onClick={handleActivate}
          disabled={false}
        >
          Activate
        </button>
      </div>
    </div>
  );
}
