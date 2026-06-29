"use client";
import img from "./../public/assets/vodafone-logo.png";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ModeToggle from "./ModeToggle";
import { AUTH_EVENT, hasCustomerSession, SESSION_KEY } from "@/lib/auth/session";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountName, setAccountName] = useState("Account");
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    const updateAccount = () => {
      setIsCustomer(hasCustomerSession());
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored || !hasCustomerSession()) {
        setAccountName("Account");
        return;
      }

      const user = JSON.parse(stored) as { name?: string };
      setAccountName(user.name || "Account");
    };

    updateAccount();
    window.addEventListener(AUTH_EVENT, updateAccount);
    return () => window.removeEventListener(AUTH_EVENT, updateAccount);
  }, []);

  const menuItems = [
    { name: "eShop", href: "/eshop" },
    { name: "Tourist Pack", href: "/tourist-pack" },
    { name: "Support", href: "/support" },
  ];

  const openAuth = () => {
    window.dispatchEvent(new Event("vodafone-open-auth"));
  };

  return (
    <header className="header bg-white dark:bg-black text-black dark:text-white">
      <div className="header-content">
        {/* Logo */}
        <Image
          src={img}
          objectFit="contain"
          alt="vodafone logo"
          width={50}
          height={50}
        />

        {/* Desktop Navigation */}
        <nav className="nav">
          {menuItems.map((item) => (
            <ul key={item.name} className="nav-link">
              {item.name}
            </ul>
          ))}
        </nav>

        {/* Header Buttons */}
        <div className="header-buttons">
          <button className="header-button">
            <img src="/Searchbar.svg" alt="searchBar" width="24" height="24"/>
          </button>
          <button className="header-button">
            <img src="/shoppingCart.svg" alt="shoppingCart" width="24" height="24"/>
          </button>
          <button
            className="header-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <img src="threeLines.svg" alt="threeLines" width = "24" height = "24"></img>
          </button>
          <ModeToggle />
          {isCustomer ? (
            <Link
              href="/profile"
              className="account-button profile-link"
              aria-label={`Open profile. Current session: ${accountName}`}
            >
              <span aria-hidden="true" className="account-avatar">{accountName.charAt(0).toUpperCase()}</span>
              <span className="account-label">{accountName}</span>
            </Link>
          ) : (
            <button
              type="button"
              className="account-button profile-link"
              onClick={openAuth}
              aria-label="Open login"
            >
              <span aria-hidden="true" className="account-avatar">A</span>
              <span className="account-label">Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </header>
  );
}
