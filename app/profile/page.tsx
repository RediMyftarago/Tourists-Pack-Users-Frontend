"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginMod";
import { logoutUser } from "@/lib/auth/api";
import { ACCOUNT_KEY, AUTH_EVENT, clearCustomerSession, getAuthToken, hasCustomerSession, SESSION_KEY } from "@/lib/auth/session";
import logo from "../../public/assets/vodafone-logo.png";

type SessionUser = {
  name: string;
  email?: string;
  type: "guest" | "customer";
};

type StoredAccount = {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
};

type ProfileTransaction = {
  id: string;
  title: string;
  description: string;
  date: string;
  label: "Discount" | "Activated offer";
  value: string;
};

type StoredTransaction = {
  id: string;
  title: string;
  price: string;
  duration: string;
  discount?: number;
  status: string;
  date: string;
};

type StoredDiscountCoupon = {
  id: string;
  discount: number;
  date: string;
  status: string;
};

const TRANSACTIONS_KEY = "vodafone-demo-transactions";
const DISCOUNT_COUPONS_KEY = "vodafone-demo-discount-coupons";
const SESSION_DISCOUNT_KEY = "vodafone-tourist-discount";

const readStoredList = <T,>(key: string): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatActivityDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86400000
  );

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [account, setAccount] = useState<StoredAccount | null>(null);
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [discountCoupons, setDiscountCoupons] = useState<StoredDiscountCoupon[]>([]);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const readProfileData = () => {
      if (!hasCustomerSession()) {
        router.replace("/");
        return;
      }

      const storedSession = sessionStorage.getItem(SESSION_KEY);
      const storedAccount = sessionStorage.getItem(ACCOUNT_KEY);

      setUser(storedSession ? JSON.parse(storedSession) : null);
      setAccount(storedAccount ? JSON.parse(storedAccount) : null);
      setTransactions(readStoredList<StoredTransaction>(TRANSACTIONS_KEY));

      const storedCoupons = readStoredList<StoredDiscountCoupon>(DISCOUNT_COUPONS_KEY);
      const activeDiscount = sessionStorage.getItem(SESSION_DISCOUNT_KEY);

      if (activeDiscount && storedCoupons.length === 0) {
        setDiscountCoupons([
          {
            id: "active-discount",
            discount: Number(activeDiscount),
            date: new Date().toISOString(),
            status: "Available",
          },
        ]);
      } else {
        setDiscountCoupons(storedCoupons);
      }
    };

    readProfileData();
    window.addEventListener(AUTH_EVENT, readProfileData);
    window.addEventListener("vodafone-transaction-added", readProfileData);
    window.addEventListener("vodafone-discount-added", readProfileData);

    return () => {
      window.removeEventListener(AUTH_EVENT, readProfileData);
      window.removeEventListener("vodafone-transaction-added", readProfileData);
      window.removeEventListener("vodafone-discount-added", readProfileData);
    };
  }, [router]);

  const displayName = useMemo(() => {
    if (account && user?.type === "customer") {
      return `${account.firstName} ${account.lastName}`;
    }

    return user?.name || "Account";
  }, [account, user]);

  const recentActivity = useMemo<ProfileTransaction[]>(() => {
    const activatedOffers = transactions.map((transaction) => ({
      id: transaction.id,
      title: `${transaction.title} activated`,
      description: `${transaction.duration} tourist pack${transaction.discount ? ` with ${transaction.discount}% roulette discount` : ""}.`,
      date: formatActivityDate(transaction.date),
      label: "Activated offer" as const,
      value: transaction.price,
      sortDate: new Date(transaction.date).getTime() || 0,
    }));

    const coupons = discountCoupons.map((coupon) => ({
      id: coupon.id,
      title: `${coupon.discount}% discount coupon`,
      description: `${coupon.status || "Available"} roulette reward for your next tourist pack.`,
      date: formatActivityDate(coupon.date),
      label: "Discount" as const,
      value: `-${coupon.discount}%`,
      sortDate: new Date(coupon.date).getTime() || 0,
    }));

    return [...activatedOffers, ...coupons]
      .sort((left, right) => right.sortDate - left.sortDate)
      .slice(0, 6)
      .map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        label: activity.label,
        value: activity.value,
      }));
  }, [transactions, discountCoupons]);

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logoutUser(getAuthToken());
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Logout failed on the server.");
    } finally {
      clearCustomerSession();
      setIsLoggingOut(false);
      router.replace("/login");
    }
  };

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const email = account?.email || user?.email || "No email saved";
  const phone = account?.phone || "No phone saved";
  const accountType = "Registered customer";

  return (
    <div className="page">
      <LoginModal />
      <Header />

      <main className="profile-page">
        <section className="profile-hero-card">
          <div className="profile-brand-mark">
            <Image src={logo} alt="Vodafone Albania" width={52} height={52} />
          </div>

          <div className="profile-avatar-large" aria-hidden="true">
            {initials}
          </div>

          <div className="profile-hero-copy">
            <span className="auth-eyebrow">My Vodafone</span>
            <h1>{displayName}</h1>
            <p>{accountType}</p>
          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </section>

        {logoutError && <p className="profile-alert" role="alert">{logoutError}</p>}

        <section className="profile-grid">
          <article className="profile-card">
            <div className="profile-card-heading">
              <span>Personal information</span>
              <button
                type="button"
                className="profile-small-action"
                onClick={() => window.dispatchEvent(new Event("vodafone-open-auth"))}
              >
                Switch account
              </button>
            </div>

            <dl className="profile-info-list">
              <div>
                <dt>Name</dt>
                <dd>{displayName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{phone}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>{accountType}</dd>
              </div>
              <div>
                <dt>Service</dt>
                <dd>Vodafone Albania Tourist Packs</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card transactions-card">
            <div className="profile-card-heading">
              <span>Recent activity</span>
              <small>Discounts and offers</small>
            </div>

            <div className="transaction-list">
              {recentActivity.length > 0 ? recentActivity.map((transaction) => (
                <div className="transaction-item" key={transaction.id}>
                  <div>
                    <strong>{transaction.title}</strong>
                    <span>{transaction.description}</span>
                  </div>
                  <div className="transaction-meta">
                    <strong>{transaction.value}</strong>
                    <small>{transaction.date}</small>
                    <em>{transaction.label}</em>
                  </div>
                </div>
              )) : (
                <div className="profile-empty-state">
                  <strong>No activity yet</strong>
                  <span>Your activated packs and discount coupons will appear here.</span>
                </div>
              )}
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
