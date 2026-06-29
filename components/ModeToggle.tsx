"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

export default function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTheme = mounted ? resolvedTheme : "light";

  return (
    <div ref={ref} className="theme-control">
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Color theme: ${currentTheme}`}
      >
        <span aria-hidden="true">{currentTheme === "dark" ? "☾" : "☀"}</span>
        <span className="theme-toggle-label">{currentTheme === "dark" ? "Dark" : "Light"}</span>
      </button>

      <div
        className={`theme-menu ${open ? "open" : ""}`}
        role="menu"
      >
        <DropdownItem
          onClick={() => {
            setTheme("light");
            setOpen(false);
          }}
          active={currentTheme === "light"}
          icon="☀"
          label="Light"
        />

        <DropdownItem
          onClick={() => {
            setTheme("dark");
            setOpen(false);
          }}
          active={currentTheme === "dark"}
          icon="☾"
          label="Dark"
        />
      </div>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`theme-option ${active ? "active" : ""}`}
      onClick={onClick}
      role="menuitemradio"
      aria-checked={active}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
      {active && <span className="theme-option-check" aria-hidden="true">✓</span>}
    </button>
  );
}
