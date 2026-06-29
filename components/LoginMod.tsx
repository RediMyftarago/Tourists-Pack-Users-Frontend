"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import logo from "../public/assets/vodafone-logo.png";
import { loginUser, registerUser } from "@/lib/auth/api";
import { createSessionFromAuthResponse, hasCustomerSession, isAdminAuthResponse, publishSession, saveAuthToken, saveStoredAccount } from "@/lib/auth/session";
import type { AuthView, LoginForm, RegisterForm, StoredAccount } from "@/lib/auth/types";
import { isInvalidName, isValidPassword, NAME_PATTERN, passwordRules } from "@/lib/auth/validation";

const ADMIN_FRONTEND_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

const initialRegisterForm: RegisterForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const initialLoginForm: LoginForm = {
  phone: "",
  email: "",
  password: "",
};

export default function LoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(initialRegisterForm);
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm);

  useEffect(() => {
    setView("login");
    setOpen(!hasCustomerSession());

    const openAuth = () => {
      setView("login");
      setError("");
      setOpen(true);
    };

    window.addEventListener("vodafone-open-auth", openAuth);
    return () => window.removeEventListener("vodafone-open-auth", openAuth);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const changeView = (nextView: AuthView) => {
    setError("");
    setView(nextView);
  };

  const updateRegisterField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const updateLoginField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const hasValidPassword = isValidPassword(registerForm.password);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);
    const account: StoredAccount & { password: string } = {
      firstName: String(data.get("firstName") ?? "").trim(),
      lastName: String(data.get("lastName") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
    };
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (!NAME_PATTERN.test(account.firstName) || !NAME_PATTERN.test(account.lastName)) {
      setError("Please use alphabetic characters only for first and last name.");
      return;
    }

    if (!account.phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!passwordRules.every((rule) => rule.test(account.password))) {
      setError("Please complete all password requirements.");
      return;
    }

    if (account.password !== confirmPassword) {
      setError("The passwords do not match. Please try again.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await registerUser({
        firstName: account.firstName,
        lastName: account.lastName,
        fullName: `${account.firstName} ${account.lastName}`,
        email: account.email,
        phoneNumber: account.phone,
        password: account.password,
      });

      const storedAccount: StoredAccount = {
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        phone: account.phone,
      };

      saveAuthToken(result.token);
      saveStoredAccount(storedAccount);
      publishSession(createSessionFromAuthResponse(storedAccount, result));

      setOpen(false);
      setRegisterForm(initialRegisterForm);
      router.push("/");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await loginUser({
        email,
        phoneNumber: phone,
        password,
      });

      const responseUser = result.user;
      const fullName = responseUser?.fullName || result.fullName || responseUser?.name || result.name || "";
      const [firstName = email, ...lastNameParts] = fullName.split(" ").filter(Boolean);
      const storedAccount: StoredAccount = {
        firstName: responseUser?.firstName || result.firstName || firstName,
        lastName: responseUser?.lastName || result.lastName || lastNameParts.join(" "),
        email: responseUser?.email || result.email || email,
        phone: responseUser?.phoneNumber || result.phoneNumber || responseUser?.phone || result.phone || phone,
      };

      saveAuthToken(result.token);
      saveStoredAccount(storedAccount);
      publishSession(createSessionFromAuthResponse(storedAccount, result));

      setOpen(false);
      setLoginForm(initialLoginForm);

      if (isAdminAuthResponse(result)) {
        const params = new URLSearchParams({
          token: result.token,
          name: `${storedAccount.firstName} ${storedAccount.lastName}`.trim(),
          email: storedAccount.email,
          phone: storedAccount.phone,
          role: result.roles || result.role || result.user?.roles || result.user?.role || "ADMIN",
        });

        window.location.href = `${ADMIN_FRONTEND_URL}/#${params.toString()}`;
        return;
      }

      router.push("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <div className="auth-brand">
          <Image src={logo} alt="Vodafone" width={54} height={54} priority />
          <div>
            <strong>Vodafone Albania</strong>
            <span>Tourist connectivity</span>
          </div>
        </div>

        {view === "welcome" && (
          <div className="auth-view">
            <div className="auth-heading">
              <span className="auth-eyebrow">Welcome</span>
              <h2 id="auth-title">Choose how to continue</h2>
              <p>Sign in to your account or create one before choosing your tourist pack.</p>
            </div>

            <div className="auth-choice-grid">
              <button type="button" className="auth-choice primary" onClick={() => changeView("login")}>
                <span className="auth-choice-icon" aria-hidden="true">IN</span>
                <span><strong>Login</strong><small>Use your saved account and phone number.</small></span>
              </button>
              <button type="button" className="auth-choice" onClick={() => changeView("register")}>
                <span className="auth-choice-icon" aria-hidden="true">+</span>
                <span><strong>Register</strong><small>Create an account for faster visits.</small></span>
              </button>
            </div>

            <p className="auth-privacy">Your details stay in this browser for this front-end demo.</p>
          </div>
        )}

        {view === "register" && (
          <div className="auth-view auth-form-view">
            <button type="button" className="auth-back" onClick={() => changeView("welcome")}>Back</button>
            <div className="auth-heading compact">
              <span className="auth-eyebrow">First time here?</span>
              <h2 id="auth-title">Create your account</h2>
              <p>Register once to make your next visit faster.</p>
            </div>
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-field-row">
                <label>
                  First name
                  <input className="modal-input" name="firstName" autoComplete="given-name" value={registerForm.firstName} onChange={updateRegisterField} required />
                  {isInvalidName(registerForm.firstName) && <span className="field-message">This field should contain alphabetic characters only.</span>}
                </label>
                <label>
                  Last name
                  <input className="modal-input" name="lastName" autoComplete="family-name" value={registerForm.lastName} onChange={updateRegisterField} required />
                  {isInvalidName(registerForm.lastName) && <span className="field-message">This field should contain alphabetic characters only.</span>}
                </label>
              </div>
              <label>Phone number<input className="modal-input" name="phone" type="tel" autoComplete="tel" placeholder="+355 69 123 4567" value={registerForm.phone} onChange={updateRegisterField} required /></label>
              <label>Email address<input className="modal-input" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={registerForm.email} onChange={updateRegisterField} required /></label>
              <label>
                Password
                <input className="modal-input" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={registerForm.password} onChange={updateRegisterField} required />
                <span className="password-checklist" aria-live="polite">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(registerForm.password);
                    return (
                      <span key={rule.key} className={passed ? "requirement met" : "requirement"}>
                        <span aria-hidden="true">{passed ? "OK" : "X"}</span>
                        {rule.label}
                      </span>
                    );
                  })}
                </span>
              </label>
              <label>Confirm password<input className="modal-input" name="confirmPassword" type="password" autoComplete="new-password" value={registerForm.confirmPassword} onChange={updateRegisterField} required /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="modal-login-btn" type="submit" disabled={isSubmitting || isInvalidName(registerForm.firstName) || isInvalidName(registerForm.lastName) || !hasValidPassword}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
            <button type="button" className="auth-text-button" onClick={() => changeView("login")}>Already registered? Sign in</button>
          </div>
        )}

        {view === "login" && (
          <div className="auth-view auth-form-view">
            <button type="button" className="auth-back" onClick={() => changeView("welcome")}>Back</button>
            <div className="auth-heading compact">
              <span className="auth-eyebrow">Welcome back</span>
              <h2 id="auth-title">Sign in to your account</h2>
              <p>Use the details you registered with.</p>
            </div>
            <form className="auth-form" onSubmit={handleLogin}>
              <label>Phone number<input className="modal-input" name="phone" type="tel" autoComplete="tel" placeholder="+355 69 123 4567" value={loginForm.phone} onChange={updateLoginField} required /></label>
              <label>Email address<input className="modal-input" name="email" type="email" autoComplete="email" placeholder="name@example.com" value={loginForm.email} onChange={updateLoginField} required /></label>
              <label>Password<input className="modal-input" name="password" type="password" autoComplete="current-password" value={loginForm.password} onChange={updateLoginField} required /></label>
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="modal-login-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <button type="button" className="auth-text-button" onClick={() => changeView("register")}>New to Vodafone? Create an account</button>
          </div>
        )}
      </section>
    </div>
  );
}
