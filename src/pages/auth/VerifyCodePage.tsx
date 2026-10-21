import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brandLogo from "../../assets/logo.png";
import dentalHero from "../../assets/dental_hero.jpg";

export default function VerifyCodePage() {
  const navigate = useNavigate();



  // 5-digit OTP state array
  const [otp, setOtp] = useState<string[]>(["5", "2", "4", "1", ""]);
  const [countdown, setCountdown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Refs for 5 OTP input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect for resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle single character input and focus jump
  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue && value !== "") return;

    const newOtp = [...otp];
    // Take the last typed character if multiple characters entered
    newOtp[index] = cleanValue.slice(-1);
    setOtp(newOtp);
    setErrorMessage("");

    // Auto-advance focus to next field if a digit was entered
    if (cleanValue && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keypresses (Backspace navigation, Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus back if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste events across inputs
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 5);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 5; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    setErrorMessage("");

    // Focus on the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 5) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[4]?.focus();
    }
  };

  // Resend code handler
  const handleResend = () => {
    if (!canResend) return;
    setCountdown(30);
    setCanResend(false);
    setSuccessMessage("A new verification code has been sent to your email!");
    setErrorMessage("");
    // Clear success message after 4s
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Form submission handler
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 5) {
      setErrorMessage("Please enter all 5 digits of your verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    // Simulate backend verification
    setTimeout(() => {
      setIsVerifying(false);
      setSuccessMessage("Code verified successfully! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 1200);
  };

  return (
    <div style={styles.container}>
      {/* LEFT SECTION: VERIFICATION FORM */}
      <div style={styles.leftSection}>
        <div style={styles.logoHeader}>
          <img src={brandLogo} alt="NoSurgeries Logo" style={styles.logoImage} />
        </div>

        <div style={styles.formContainer}>
          <h1 style={styles.title}>Enter Verification Code</h1>
          <p style={styles.subtitle}>
            Please check your email for the verification code and enter it here to complete the process.
          </p>

          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}
          {successMessage && <div style={styles.successAlert}>{successMessage}</div>}

          <form onSubmit={handleVerify}>
            {/* 5-BOX OTP INPUT FIELDS */}
            <div style={styles.otpGrid}>
              {otp.map((digit, idx) => {
                const isFilled = digit !== "";
                return (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    style={{
                      ...styles.otpBox,
                      ...(isFilled ? styles.otpBoxFilled : styles.otpBoxEmpty),
                    }}
                    autoFocus={idx === 4 && !digit}
                  />
                );
              })}
            </div>

            {/* RESEND TIMER SECTION */}
            <div style={styles.resendWrapper}>
              <div style={styles.timerText}>
                {countdown > 0 ? (
                  <>
                    You can resend the code in{" "}
                    <span style={styles.timerCount}>{countdown}</span> seconds
                  </>
                ) : (
                  "Didn't receive code?"
                )}
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                style={{
                  ...styles.resendBtn,
                  ...(canResend ? styles.resendBtnActive : styles.resendBtnDisabled),
                }}
              >
                Resend Code
              </button>
            </div>

            {/* VERIFY CODE ACTION BUTTON */}
            <button
              id="verify-code-btn"
              type="submit"
              disabled={isVerifying}
              style={{
                ...styles.verifyBtn,
                ...(isVerifying ? styles.verifyBtnDisabled : {}),
              }}
            >
              {isVerifying ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          {/* BACK TO SIGN IN NAVIGATION */}
          <div style={styles.footerNav}>
            <span style={styles.backText}>Incorrect email? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={styles.backLink}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: FULL-HEIGHT CLINICAL DENTAL HERO IMAGE */}
      <div style={styles.rightSection}>
        <img
          src={dentalHero}
          alt="Dental Examination & Procedure"
          style={styles.heroImage}
        />
        <div style={styles.heroOverlay}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeDot} />
            Patient Care & Precision
          </div>
          <h2 style={styles.heroTitle}>Comprehensive Non-Surgical Care</h2>
          <p style={styles.heroSub}>
            Book seamless consultations with top healthcare specialists across verified hospitals.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #verify-code-btn:not(:disabled):hover {
          background-color: #005260 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 102, 119, 0.35);
        }
        @media (max-width: 900px) {
          .verify-page-right {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inline Style Tokens matching exact screenshot aesthetic
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f2f8fc",
    overflow: "hidden",
  },
  leftSection: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 32px",
    boxSizing: "border-box",
    position: "relative",
    backgroundColor: "#f4f9fd",
  },
  logoHeader: {
    position: "absolute",
    top: 32,
    left: 40,
    display: "flex",
    alignItems: "center",
  },
  logoImage: {
    height: 42,
    width: "auto",
    objectFit: "contain",
  },
  formContainer: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 10px 0",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.5,
    color: "#64748b",
    margin: "0 0 32px 0",
    fontWeight: 400,
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
  },
  successAlert: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
  },
  otpGrid: {
    display: "flex",
    gap: 14,
    justifyContent: "flex-start",
    marginBottom: 24,
  },
  otpBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    border: "1.5px solid #cbd5e1",
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    outline: "none",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    fontFamily: "inherit",
  },
  otpBoxFilled: {
    backgroundColor: "#29c4e0",
    borderColor: "#29c4e0",
    color: "#0f172a",
    boxShadow: "0 4px 14px rgba(41, 196, 224, 0.35)",
  },
  otpBoxEmpty: {
    backgroundColor: "#ffffff",
    borderColor: "#29c4e0",
    color: "#0f172a",
  },
  resendWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: 400,
  },
  timerCount: {
    color: "#29c4e0",
    fontWeight: 600,
  },
  resendBtn: {
    background: "none",
    border: "none",
    fontSize: 15,
    fontWeight: 600,
    color: "#29c4e0",
    cursor: "pointer",
    padding: 0,
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  },
  resendBtnActive: {
    opacity: 1,
    textDecoration: "underline",
  },
  resendBtnDisabled: {
    opacity: 0.9,
    cursor: "default",
  },
  verifyBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#006677",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 102, 119, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  verifyBtnDisabled: {
    opacity: 0.75,
    cursor: "not-allowed",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footerNav: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
  },
  backText: {
    color: "#64748b",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#006677",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginLeft: 4,
    fontFamily: "inherit",
  },
  rightSection: {
    flex: "1 1 50%",
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "60px 48px 48px",
    background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(41, 196, 224, 0.2)",
    color: "#67e8f9",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    width: "fit-content",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(41, 196, 224, 0.3)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#29c4e0",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
    color: "#ffffff",
  },
  heroSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    margin: 0,
    lineHeight: 1.5,
  },
};
