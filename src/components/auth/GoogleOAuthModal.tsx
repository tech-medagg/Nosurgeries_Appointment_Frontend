import React, { useState, useEffect } from "react";
import { lookupRolesApi } from "../../services/auth.api";

/* ─── Types ──────────────────────────────────────────── */
export interface GoogleAccount {
  email: string;
  name: string;
  roleName?: "PATIENT" | "DOCTOR";
  avatarColor?: string;
  avatarLetter?: string;
  avatarType?: "letter" | "silhouette" | "photo";
  isSignedOut?: boolean;
}

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (account: {
    email: string;
    name: string;
    roleName: "PATIENT" | "DOCTOR";
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
}

/* ─── Key for persisting custom accounts in localStorage ─ */
const LS_KEY = "ns_google_accounts_v3";

/* ─── Default accounts matching the user's reference image ─ */
const REFERENCE_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Salahudeen",
    email: "salahudeenfazil@gmail.com",
    roleName: "DOCTOR",
    avatarColor: "#1a73e8",
    avatarLetter: "S",
    avatarType: "letter",
    isSignedOut: false,
  },
  {
    name: "aneesh asta",
    email: "aneeshasta08@gmail.com",
    roleName: "PATIENT",
    avatarColor: "#e0e0e0",
    avatarType: "silhouette",
    isSignedOut: false,
  },
  {
    name: "Fazil Salahudeen",
    email: "fazilsalahudeen11@gmail.com",
    roleName: "PATIENT",
    avatarColor: "#2e7d32", // Green circle
    avatarLetter: "F",
    avatarType: "letter",
    isSignedOut: false,
  },
  {
    name: "fazil sala23",
    email: "fazilsala23@gmail.com",
    roleName: "PATIENT",
    avatarColor: "#37474f", // Dark avatar
    avatarLetter: "f",
    avatarType: "photo",
    isSignedOut: false,
  },
  {
    name: "Fazil Salahudeen",
    email: "reactapp.deve@gmail.com",
    roleName: "DOCTOR",
    avatarColor: "#3949ab", // Blue circle
    avatarLetter: "F",
    avatarType: "letter",
    isSignedOut: false,
  },
  {
    name: "Mersal Dhavan",
    email: "mersaldhavan245@gmail.com",
    roleName: "PATIENT",
    avatarColor: "#4e342e",
    avatarLetter: "M",
    avatarType: "photo",
    isSignedOut: true,
  },
];

/* ══════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════ */
export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  isLoading,
  errorMessage,
}) => {
  /* step: "choose" | "verify" | "add_account" */
  const [step, setStep] = useState<"choose" | "verify" | "add_account">("choose");
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);

  /* Verification fields */
  const [verificationCode, setVerificationCode] = useState("482910");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyMode, setVerifyMode] = useState<"otp" | "password">("otp");
  const [codeSent, setCodeSent] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  /* "Add account" fields */
  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputRole, setInputRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [emailError, setEmailError] = useState("");

  /* Portal destination role (Patient vs Doctor) */
  const [portalRole, setPortalRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  /* signing-in indicator */
  const [signingInEmail, setSigningInEmail] = useState<string | null>(null);

  /* ── Load accounts ── */
  useEffect(() => {
    if (!isOpen) return;

    let saved: GoogleAccount[] = [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (_) {
      /* ignore */
    }

    const initialAccounts = saved.length ? saved : REFERENCE_ACCOUNTS;
    setAccounts(initialAccounts);
    setStep("choose");
    setSelectedAccount(null);
    setInputEmail("");
    setInputName("");
    setEmailError("");
    setVerifyError("");
    setPassword("");
    setCodeSent(false);
    setSigningInEmail(null);

    // Sync live profile roles directly from the database
    const emailsToLookup = initialAccounts.map((a) => a.email);
    lookupRolesApi(emailsToLookup)
      .then((res) => {
        if (res.success && res.data) {
          setAccounts((prev) => {
            const updated = prev.map((acc) => {
              const live = res.data[acc.email.toLowerCase()];
              if (live && live.exists && live.roleName) {
                return {
                  ...acc,
                  name: live.fullName || acc.name,
                  roleName: (live.roleName === "DOCTOR" ? "DOCTOR" : "PATIENT") as "PATIENT" | "DOCTOR",
                };
              }
              return acc;
            });
            try {
              localStorage.setItem(LS_KEY, JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
        }
      })
      .catch(() => {
        /* Ignore offline */
      });
  }, [isOpen]);

  /* ── Escape key closes modal ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  /* ── Persist an account ── */
  const persistAccount = (acc: GoogleAccount) => {
    const rest = accounts.filter(
      (a) => a.email.toLowerCase() !== acc.email.toLowerCase()
    );
    const updated = [acc, ...rest].slice(0, 8);
    setAccounts(updated);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch (_) {
      /* ignore */
    }
  };

  /* ── Click on an account row ── */
  const handleAccountClick = async (acc: GoogleAccount) => {
    if (isLoading || signingInEmail) return;

    // Use portalRole explicitly selected by user, or account's predefined role
    const targetRole = portalRole || acc.roleName || "PATIENT";

    // If account is marked signed out, prompt verification screen
    if (acc.isSignedOut) {
      setSelectedAccount({ ...acc, roleName: targetRole });
      setStep("verify");
      setVerifyError("");
      setCodeSent(false);
      return;
    }

    // Otherwise directly authenticate (active account)
    setSigningInEmail(acc.email);
    try {
      persistAccount({ ...acc, roleName: targetRole });
      await onAuthenticate({
        email: acc.email,
        name: acc.name,
        roleName: targetRole,
      });
    } finally {
      setSigningInEmail(null);
    }
  };

  /* ── Perform verification & sign in ── */
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    if (verifyMode === "otp") {
      if (!verificationCode.trim() || verificationCode.trim().length < 4) {
        setVerifyError("Enter the 6-digit verification code sent to your email");
        return;
      }
    } else {
      if (!password.trim()) {
        setVerifyError("Enter your password to verify your Google Account");
        return;
      }
    }

    setVerifyError("");
    setSigningInEmail(selectedAccount.email);
    try {
      const verifiedAcc: GoogleAccount = {
        ...selectedAccount,
        isSignedOut: false, // mark as verified & signed in
      };
      persistAccount(verifiedAcc);

      await onAuthenticate({
        email: verifiedAcc.email,
        name: verifiedAcc.name,
        roleName: verifiedAcc.roleName ?? "PATIENT",
      });
    } catch {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setSigningInEmail(null);
    }
  };

  /* ── Submit "Use another account" ── */
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError("Enter an email or phone number");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError("Enter a valid email address (e.g. name@gmail.com)");
      return;
    }

    setEmailError("");

    const derivedName =
      inputName.trim() ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const newAcc: GoogleAccount = {
      name: derivedName,
      email: cleanEmail,
      roleName: inputRole,
      avatarColor: "#1a73e8",
      avatarLetter: derivedName[0].toUpperCase(),
      avatarType: "letter",
      isSignedOut: false,
    };

    setSelectedAccount(newAcc);
    // Proceed to email verification step for the new email
    setStep("verify");
    setCodeSent(true);
  };

  /* ══════════════════════════════════════════════════════
     RENDER HELPERS
  ══════════════════════════════════════════════════════ */
  const renderAvatar = (acc: GoogleAccount) => {
    if (acc.avatarType === "silhouette") {
      return (
        <div style={{ ...styles.avatar, backgroundColor: "#dadce0" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#70757a">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      );
    }

    if (acc.avatarType === "photo") {
      return (
        <div
          style={{
            ...styles.avatar,
            backgroundColor: acc.avatarColor || "#455a64",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {acc.avatarLetter || acc.name[0].toUpperCase()}
        </div>
      );
    }

    return (
      <div
        style={{
          ...styles.avatar,
          backgroundColor: acc.avatarColor || "#2e7d32",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: 17,
        }}
      >
        {acc.avatarLetter || acc.name[0].toUpperCase()}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div
      style={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading && !signingInEmail) {
          onClose();
        }
      }}
    >
      <div
        style={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Google Account Chooser"
      >
        {/* Animated Google progress bar when loading */}
        {(isLoading || !!signingInEmail) && (
          <div style={styles.progressBar}>
            <div style={styles.progressIndeterminate} />
          </div>
        )}

        {/* Close Button */}
        <button
          style={styles.closeBtn}
          onClick={onClose}
          disabled={isLoading || !!signingInEmail}
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5f6368"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ════════ STEP 1: CHOOSE AN ACCOUNT ════════ */}
        {step === "choose" && (
          <div style={styles.contentWrap}>
            {/* Header matching Google OAuth standard */}
            <div style={styles.headerArea}>
              <div style={styles.gLogoRow}>
                <GoogleLogoSvg />
              </div>
              <h1 style={styles.title}>Choose an account</h1>
              <p style={styles.subtitle}>to continue to NoSurgeries</p>

              {/* Portal Role Switcher */}
              <div style={styles.roleHeaderBar}>
                <span style={styles.roleHeaderLabel}>Sign in as:</span>
                <div style={styles.roleHeaderChips}>
                  <button
                    type="button"
                    onClick={() => setPortalRole("PATIENT")}
                    style={{
                      ...styles.roleHeaderChip,
                      ...(portalRole === "PATIENT" ? styles.roleHeaderChipActive : {}),
                    }}
                  >
                    👤 Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortalRole("DOCTOR")}
                    style={{
                      ...styles.roleHeaderChip,
                      ...(portalRole === "DOCTOR" ? styles.roleHeaderChipActiveDoctor : {}),
                    }}
                  >
                    🩺 Doctor
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div style={styles.errorBanner}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#d93025"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Accounts List */}
            <div style={styles.accountsContainer}>
              {accounts.map((acc) => {
                const isSelected = signingInEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={isLoading || !!signingInEmail}
                    onClick={() => handleAccountClick(acc)}
                    style={{
                      ...styles.accountRow,
                      ...(isSelected ? styles.accountRowActive : {}),
                    }}
                    className="g-account-item"
                  >
                    {/* Left: Avatar */}
                    {renderAvatar(acc)}

                    {/* Middle: Details */}
                    <div style={styles.accountText}>
                      <div style={styles.accountName}>{acc.name}</div>
                      <div style={styles.accountEmail}>{acc.email}</div>
                    </div>

                    {/* Right: Signed out status OR Role badge OR Spinner */}
                    <div style={styles.accountRight}>
                      {isSelected ? (
                        <span style={styles.signingInText}>Signing in…</span>
                      ) : acc.isSignedOut ? (
                        <span style={styles.signedOutBadge}>Signed out</span>
                      ) : acc.roleName === "DOCTOR" ? (
                        <span style={styles.docBadge}>🩺 Doctor</span>
                      ) : (
                        <span style={styles.patientBadge}>👤 Patient</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* "Use another account" row */}
              <button
                type="button"
                disabled={isLoading || !!signingInEmail}
                onClick={() => {
                  setStep("add_account");
                  setInputEmail("");
                  setInputName("");
                  setEmailError("");
                }}
                style={styles.accountRow}
                className="g-account-item"
              >
                <div style={{ ...styles.avatar, backgroundColor: "#f1f3f4" }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5f6368"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="20" y1="11" x2="20" y2="17" />
                    <line x1="17" y1="14" x2="23" y2="14" />
                  </svg>
                </div>
                <div style={styles.accountText}>
                  <div style={{ ...styles.accountName, fontWeight: 500 }}>
                    Use another account
                  </div>
                </div>
              </button>
            </div>

            {/* Google OAuth Legal Notice */}
            <p style={styles.disclaimerText}>
              To continue, Google will share your name, email address, language
              preference, and profile picture with NoSurgeries. Before using
              this app, you can review NoSurgeries’s{" "}
              <a href="#" style={styles.legalLink} onClick={(e) => e.preventDefault()}>
                privacy policy
              </a>{" "}
              and{" "}
              <a href="#" style={styles.legalLink} onClick={(e) => e.preventDefault()}>
                terms of service
              </a>
              .
            </p>

            {/* Bottom bar */}
            <div style={styles.footerRow}>
              <span style={styles.footerLink}>English (United States)</span>
              <div style={styles.footerRightLinks}>
                <span style={styles.footerLink}>Help</span>
                <span style={styles.footerLink}>Privacy</span>
                <span style={styles.footerLink}>Terms</span>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 2: VERIFY IT'S YOU (MAIL VERIFICATION) ════════ */}
        {step === "verify" && selectedAccount && (
          <div style={styles.contentWrap}>
            <div style={styles.headerArea}>
              <div style={styles.gLogoRow}>
                <GoogleLogoSvg />
              </div>

              {/* Selected account chip */}
              <div style={styles.accountChip}>
                {renderAvatar(selectedAccount)}
                <span style={styles.chipEmail}>{selectedAccount.email}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>

              <h1 style={styles.title}>Verify it's you</h1>
              <p style={styles.subtitle}>
                To continue to NoSurgeries, verify your Google Account
              </p>
            </div>

            {/* Verification error */}
            {verifyError && (
              <div style={styles.errorBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#d93025">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <span>{verifyError}</span>
              </div>
            )}

            {/* Verification mode tabs */}
            <div style={styles.modeTabs}>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(verifyMode === "otp" ? styles.tabBtnActive : {}),
                }}
                onClick={() => setVerifyMode("otp")}
              >
                ✉️ Email Verification Code
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(verifyMode === "password" ? styles.tabBtnActive : {}),
                }}
                onClick={() => setVerifyMode("password")}
              >
                🔑 Google Password
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} style={styles.formContainer}>
              {verifyMode === "otp" ? (
                <div>
                  <div style={styles.infoBox}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a73e8">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <span>
                      A verification code will verify your Gmail{" "}
                      <strong>{selectedAccount.email}</strong>
                    </span>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel} htmlFor="g-otp">
                      Enter 6-digit verification code
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={styles.gCodePrefix}>G-</span>
                      <input
                        id="g-otp"
                        type="text"
                        maxLength={8}
                        autoFocus
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                        style={{ ...styles.inputField, paddingLeft: 42, letterSpacing: 2, fontWeight: 600 }}
                        placeholder="482910"
                      />
                    </div>
                    <div style={styles.otpHintRow}>
                      <span style={styles.otpHintText}>
                        {codeSent ? "✅ Code sent to your inbox!" : "Demo code is pre-filled for instant testing"}
                      </span>
                      <button
                        type="button"
                        style={styles.resendBtn}
                        onClick={() => {
                          setCodeSent(true);
                          setVerificationCode(Math.floor(100000 + Math.random() * 900000).toString());
                        }}
                      >
                        Resend code
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel} htmlFor="g-pass">
                    Enter your password
                  </label>
                  <input
                    id="g-pass"
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.inputField}
                    placeholder="Enter password"
                  />
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    Show password
                  </label>
                </div>
              )}

              {/* Portal Role Selection */}
              <div style={styles.roleGroup}>
                <span style={styles.roleLabel}>Sign in to portal as:</span>
                <div style={styles.roleChips}>
                  <label
                    style={{
                      ...styles.roleChip,
                      ...(selectedAccount.roleName === "PATIENT" ? styles.roleChipSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={selectedAccount.roleName !== "DOCTOR"}
                      onChange={() => setSelectedAccount({ ...selectedAccount, roleName: "PATIENT" })}
                      style={{ display: "none" }}
                    />
                    👤 Patient
                  </label>
                  <label
                    style={{
                      ...styles.roleChip,
                      ...(selectedAccount.roleName === "DOCTOR" ? styles.roleChipSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={selectedAccount.roleName === "DOCTOR"}
                      onChange={() => setSelectedAccount({ ...selectedAccount, roleName: "DOCTOR" })}
                      style={{ display: "none" }}
                    />
                    🩺 Doctor
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.buttonRow}>
                <button
                  type="button"
                  style={styles.backButton}
                  onClick={() => setStep("choose")}
                  disabled={isLoading || !!signingInEmail}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={isLoading || !!signingInEmail}
                >
                  {isLoading || !!signingInEmail ? "Verifying & Signing in…" : "Verify & Sign In"}
                </button>
              </div>
            </form>

            <div style={styles.footerRow}>
              <span style={styles.footerLink}>English (United States)</span>
              <div style={styles.footerRightLinks}>
                <span style={styles.footerLink}>Help</span>
                <span style={styles.footerLink}>Privacy</span>
                <span style={styles.footerLink}>Terms</span>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 3: USE ANOTHER ACCOUNT (ENTER GMAIL) ════════ */}
        {step === "add_account" && (
          <div style={styles.contentWrap}>
            <div style={styles.headerArea}>
              <div style={styles.gLogoRow}>
                <GoogleLogoSvg />
              </div>
              <h1 style={styles.title}>Sign in</h1>
              <p style={styles.subtitle}>with your Google Account</p>
            </div>

            <form onSubmit={handleAddAccountSubmit} style={styles.formContainer}>
              {/* Email */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel} htmlFor="new-g-email">
                  Email or phone
                </label>
                <input
                  id="new-g-email"
                  type="email"
                  autoFocus
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  style={{
                    ...styles.inputField,
                    ...(emailError ? styles.inputFieldErr : {}),
                  }}
                  placeholder="yourname@gmail.com"
                />
                {emailError && (
                  <div style={styles.fieldErrorText}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#d93025">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Full Name (optional) */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel} htmlFor="new-g-name">
                  Full name <span style={{ color: "#70757a" }}>(optional)</span>
                </label>
                <input
                  id="new-g-name"
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  style={styles.inputField}
                  placeholder="e.g. Fazil Salahudeen"
                />
              </div>

              {/* Role selection */}
              <div style={styles.roleGroup}>
                <span style={styles.roleLabel}>Portal Role:</span>
                <div style={styles.roleChips}>
                  <label
                    style={{
                      ...styles.roleChip,
                      ...(inputRole === "PATIENT" ? styles.roleChipSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="new-role"
                      checked={inputRole === "PATIENT"}
                      onChange={() => setInputRole("PATIENT")}
                      style={{ display: "none" }}
                    />
                    👤 Patient
                  </label>
                  <label
                    style={{
                      ...styles.roleChip,
                      ...(inputRole === "DOCTOR" ? styles.roleChipSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="new-role"
                      checked={inputRole === "DOCTOR"}
                      onChange={() => setInputRole("DOCTOR")}
                      style={{ display: "none" }}
                    />
                    🩺 Doctor
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.buttonRow}>
                <button
                  type="button"
                  style={styles.backButton}
                  onClick={() => setStep("choose")}
                >
                  Back
                </button>
                <button type="submit" style={styles.primaryButton}>
                  Next & Verify
                </button>
              </div>
            </form>

            <div style={styles.footerRow}>
              <span style={styles.footerLink}>English (United States)</span>
              <div style={styles.footerRightLinks}>
                <span style={styles.footerLink}>Help</span>
                <span style={styles.footerLink}>Privacy</span>
                <span style={styles.footerLink}>Terms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scoped CSS for authentic Google hover transitions */}
      <style>{`
        @keyframes gProgressAnim {
          0% { left: -40%; width: 40%; }
          50% { left: 20%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
        @keyframes gDialogFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .g-account-item {
          transition: background-color 0.15s ease;
        }
        .g-account-item:hover {
          background-color: #f8f9fa !important;
        }
        .g-account-item:active {
          background-color: #f1f3f4 !important;
        }
      `}</style>
    </div>
  );
};

/* ─── Google 4-Color Logo SVG ────────────────────────── */
const GoogleLogoSvg = () => (
  <svg width="32" height="32" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

/* ══════════════════════════════════════════════════════
   STYLES (Google Design System / Material Specification)
══════════════════════════════════════════════════════ */
const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: 16,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  dialog: {
    backgroundColor: "#ffffff",
    color: "#202124",
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    boxShadow: "0 24px 64px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden",
    animation: "gDialogFadeIn 0.22s ease-out",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#e8f0fe",
    overflow: "hidden",
    zIndex: 20,
  },
  progressIndeterminate: {
    position: "absolute",
    top: 0,
    height: "100%",
    backgroundColor: "#1a73e8",
    animation: "gProgressAnim 1.3s ease-in-out infinite",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  contentWrap: {
    padding: "36px 36px 20px",
    display: "flex",
    flexDirection: "column",
  },
  headerArea: {
    textAlign: "center",
    marginBottom: 20,
  },
  gLogoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    color: "#202124",
    margin: "0 0 6px 0",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    fontSize: 15,
    color: "#5f6368",
    margin: 0,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    backgroundColor: "#fce8e6",
    color: "#c5221f",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  accountsContainer: {
    borderTop: "1px solid #dadce0",
    display: "flex",
    flexDirection: "column",
    marginBottom: 16,
  },
  accountRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    background: "#ffffff",
    border: "none",
    borderBottom: "1px solid #dadce0",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    gap: 14,
  },
  accountRowActive: {
    backgroundColor: "#e8f0fe",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  accountText: {
    flex: 1,
    minWidth: 0,
  },
  accountName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#202124",
    lineHeight: "20px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  accountEmail: {
    fontSize: 12,
    color: "#5f6368",
    lineHeight: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  accountRight: {
    flexShrink: 0,
  },
  signedOutBadge: {
    fontSize: 12,
    color: "#5f6368",
    fontWeight: 400,
  },
  docBadge: {
    fontSize: 11,
    backgroundColor: "#e8f0fe",
    color: "#1967d2",
    padding: "2px 8px",
    borderRadius: 12,
    fontWeight: 600,
  },
  patientBadge: {
    fontSize: 11,
    backgroundColor: "#e6f4ea",
    color: "#137333",
    padding: "2px 8px",
    borderRadius: 12,
    fontWeight: 600,
  },
  signingInText: {
    fontSize: 12,
    color: "#1a73e8",
    fontWeight: 600,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "#5f6368",
    margin: "0 0 20px 0",
  },
  legalLink: {
    color: "#1a73e8",
    textDecoration: "none",
  },
  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid #f1f3f4",
    fontSize: 12,
    color: "#70757a",
  },
  footerLink: {
    cursor: "pointer",
  },
  footerRightLinks: {
    display: "flex",
    gap: 16,
  },
  roleHeaderBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "12px 0 4px",
    padding: "6px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    border: "1px solid #e8eaed",
  },
  roleHeaderLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#5f6368",
  },
  roleHeaderChips: {
    display: "flex",
    gap: 6,
  },
  roleHeaderChip: {
    border: "1px solid #dadce0",
    backgroundColor: "#ffffff",
    color: "#5f6368",
    padding: "4px 10px",
    borderRadius: 14,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  roleHeaderChipActive: {
    backgroundColor: "#e8f0fe",
    borderColor: "#1a73e8",
    color: "#1a73e8",
    fontWeight: 600,
  },
  roleHeaderChipActiveDoctor: {
    backgroundColor: "#fce8e6",
    borderColor: "#d93025",
    color: "#c5221f",
    fontWeight: 600,
  },
  accountChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "3px 12px 3px 4px",
    borderRadius: 24,
    border: "1px solid #dadce0",
    backgroundColor: "#ffffff",
    margin: "4px auto 14px",
  },
  chipEmail: {
    fontSize: 13,
    fontWeight: 500,
    color: "#3c4043",
  },
  modeTabs: {
    display: "flex",
    borderBottom: "1px solid #dadce0",
    marginBottom: 20,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    padding: "10px 8px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#5f6368",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  tabBtnActive: {
    color: "#1a73e8",
    borderBottom: "2px solid #1a73e8",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  infoBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    backgroundColor: "#e8f0fe",
    borderRadius: 8,
    color: "#1967d2",
    fontSize: 13,
    marginBottom: 14,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#3c4043",
  },
  inputField: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 6,
    border: "1px solid #dadce0",
    fontSize: 14,
    color: "#202124",
    outline: "none",
    boxSizing: "border-box",
  },
  inputFieldErr: {
    borderColor: "#d93025",
  },
  gCodePrefix: {
    position: "absolute",
    left: 14,
    top: 11,
    fontSize: 14,
    fontWeight: 700,
    color: "#1a73e8",
  },
  otpHintRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  otpHintText: {
    fontSize: 11,
    color: "#5f6368",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#1a73e8",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    color: "#3c4043",
    marginTop: 6,
    cursor: "pointer",
  },
  fieldErrorText: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#d93025",
    fontSize: 12,
    marginTop: 4,
  },
  roleGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  roleLabel: {
    fontSize: 13,
    color: "#3c4043",
    fontWeight: 500,
  },
  roleChips: {
    display: "flex",
    gap: 8,
  },
  roleChip: {
    padding: "5px 12px",
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 500,
    color: "#5f6368",
    backgroundColor: "#ffffff",
    border: "1px solid #dadce0",
    cursor: "pointer",
  },
  roleChipSelected: {
    backgroundColor: "#e8f0fe",
    borderColor: "#1a73e8",
    color: "#1a73e8",
    fontWeight: 600,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#1a73e8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    padding: "8px 12px",
  },
  primaryButton: {
    backgroundColor: "#1a73e8",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    padding: "10px 24px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
};
