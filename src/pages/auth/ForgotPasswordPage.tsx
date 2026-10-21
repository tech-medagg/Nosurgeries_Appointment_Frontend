import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import brandLogo from "../../assets/logo.png";
import { BRAND } from "../../theme/theme";

/* ── Validation Schemas ──────────────────────────────── */
const requestResetSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or Phone number is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
        /^\+?[0-9\s\-()]{10,15}$/.test(val),
      "Enter a valid email address or 10-digit mobile number"
    ),
});

const resetPasswordSchema = z
  .object({
    otp: z.string().min(4, "Enter the 4-digit code sent to your email/phone").max(6, "Code too long"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestResetValues = z.infer<typeof requestResetSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/* ── SVG Icons ───────────────────────────────────────── */
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailPhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-2-2l2 2m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    <circle cx="7.5" cy="7.5" r="2.5" />
    <path d="M10.5 10.5L18 18m-2-4.5l3 3" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={BRAND.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ── Medical Illustration (Right Panel) ──────────────── */
const MedicalSecurityIllustration = () => (
  <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 360, filter: "drop-shadow(0 20px 60px rgba(41,196,224,0.25))" }}>
    {/* Glow orb behind */}
    <ellipse cx="200" cy="240" rx="160" ry="140" fill="rgba(41,196,224,0.07)" />
    <ellipse cx="200" cy="240" rx="100" ry="85" fill="rgba(91,45,142,0.12)" />

    {/* Shield outer contour */}
    <path d="M200 60 L310 110 V230 C310 310 200 380 200 380 C200 380 90 310 90 230 V110 L200 60 Z"
      fill="#1c2646" stroke={BRAND.cyan} strokeWidth="2" opacity="0.95" />

    {/* Inner Shield Accent */}
    <path d="M200 78 L294 121 V225 C294 294 200 355 200 355 C200 355 106 294 106 225 V121 L200 78 Z"
      fill="#28355c" stroke="rgba(232,45,124,0.3)" strokeWidth="1.5" />

    {/* Lock icon inside shield */}
    <rect x="160" y="210" width="80" height="70" rx="12" fill={BRAND.purple} opacity="0.9" />
    <path d="M174 210 V175 C174 160.6 185.6 149 200 149 C214.4 149 226 160.6 226 175 V210"
      stroke={BRAND.cyan} strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="200" cy="240" r="8" fill="#ffffff" />
    <rect x="197" y="244" width="6" height="16" rx="3" fill="#ffffff" />

    {/* Pulse ring around lock */}
    <circle cx="200" cy="240" r="55" stroke={BRAND.cyan} strokeWidth="1.5" fill="none" opacity="0.5">
      <animate attributeName="r" values="55;75;55" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
    </circle>

    {/* Floating Medical Cross left */}
    <rect x="50" y="140" width="28" height="9" rx="3" fill={BRAND.pink} opacity="0.7" />
    <rect x="59.5" y="130.5" width="9" height="28" rx="3" fill={BRAND.pink} opacity="0.7" />

    {/* Floating Key right */}
    <circle cx="340" cy="150" r="14" fill="none" stroke={BRAND.cyan} strokeWidth="3" opacity="0.8" />
    <line x1="330" y1="160" x2="310" y2="180" stroke={BRAND.cyan} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <line x1="316" y1="174" x2="322" y2="180" stroke={BRAND.cyan} strokeWidth="2" opacity="0.8" />

    {/* Heartbeat EKG strip bottom */}
    <rect x="60" y="400" width="280" height="50" rx="12" fill="#1e2d54" stroke="rgba(41,196,224,0.2)" strokeWidth="1" />
    <polyline points="75,425 105,425 115,410 127,440 139,415 151,425 180,425 190,418 202,433 214,425 245,425"
      fill="none" stroke={BRAND.cyan} strokeWidth="2" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2.2s" repeatCount="indefinite" />
    </polyline>

    <text x="200" y="32" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter,sans-serif">Secure Account Recovery</text>
    <text x="200" y="50" textAnchor="middle" fill={BRAND.cyan} fontSize="11" fontFamily="Inter,sans-serif" opacity="0.75">Encrypted & Safe · NoSurgeries</text>
  </svg>
);

/* ════════════════════════════════════════════════════════
   FORGOT / RESET PASSWORD PAGE
═══════════════════════════════════════════════════════ */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // Step 1: Identifier -> Step 2: Reset Form -> Step 3: Success
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Form step 1: Request code */
  const requestForm = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { identifier: "" },
    mode: "onTouched",
  });

  /* Form step 2: Reset password */
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "1234", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  /* Handle Step 1 Submit */
  const onRequestSubmit = async (values: RequestResetValues) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      // Simulate code dispatch
      await new Promise((r) => setTimeout(r, 800));
      void values.identifier;
      setStep(2);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setServerError(e?.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Handle Step 2 Submit */
  const onResetSubmit = async () => {
    setServerError("");
    setIsSubmitting(true);
    try {
      // Simulate password reset
      await new Promise((r) => setTimeout(r, 1000));
      setStep(3);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setServerError(e?.message || "Failed to reset password. Please check your code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Background elements */}
      <div style={s.bg} />
      <div style={s.grid} />
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

      <div style={s.layout}>
        {/* ══════════ LEFT: FORM ══════════ */}
        <div style={s.leftPanel}>
          <div style={s.card}>
            {/* Top accent bar */}
            <div style={s.accentBar} />

            <div style={s.cardInner}>
              {/* Logo */}
              <div style={s.logoWrap}>
                <div style={s.logoBox}>
                  <img src={brandLogo} alt="NoSurgeries" style={{ height: 42, width: "auto", objectFit: "contain" }} />
                </div>
              </div>

              {/* Step 1: Identifier Input */}
              {step === 1 && (
                <>
                  <div style={s.titleGroup}>
                    <h1 style={s.heading}>Forgot Password</h1>
                    <p style={s.subheading}>
                      Enter your email address or mobile number to receive a verification code
                    </p>
                  </div>

                  {serverError && (
                    <div style={s.errorBanner}>
                      <AlertIcon />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} noValidate style={{ width: "100%" }}>
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="reset-identifier">Email or Mobile Number</label>
                      <div style={{
                        ...s.inputWrap,
                        ...(requestForm.formState.errors.identifier ? s.inputWrapError : requestForm.formState.touchedFields.identifier ? s.inputWrapSuccess : {}),
                      }}>
                        <span style={s.inputIcon}><MailPhoneIcon /></span>
                        <input
                          id="reset-identifier"
                          type="text"
                          placeholder="e.g. name@mail.com or +91 9876543210"
                          style={s.input}
                          {...requestForm.register("identifier")}
                        />
                      </div>
                      {requestForm.formState.errors.identifier && (
                        <span style={s.fieldError}>
                          <AlertIcon /> {requestForm.formState.errors.identifier.message}
                        </span>
                      )}
                    </div>

                    <button
                      id="request-code-btn"
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        ...s.submitBtn,
                        ...(isSubmitting ? s.submitBtnDisabled : {}),
                      }}
                    >
                      {isSubmitting ? (
                        <span style={s.spinnerWrap}>
                          <span style={s.spinner} />
                          Sending Code…
                        </span>
                      ) : (
                        "Send Verification Code"
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Step 2: Set New Password (Screen requested by user) */}
              {step === 2 && (
                <>
                  <div style={s.titleGroup}>
                    <h1 style={s.heading}>Forgot Password</h1>
                    <p style={s.subheading}>
                      Choose a strong password to secure your account. Make sure it's something unique and memorable!
                    </p>
                  </div>

                  {serverError && (
                    <div style={s.errorBanner}>
                      <AlertIcon />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={resetForm.handleSubmit(onResetSubmit)} noValidate style={{ width: "100%" }}>
                    {/* OTP verification input */}
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="reset-otp">Verification Code</label>
                      <div style={{
                        ...s.inputWrap,
                        ...(resetForm.formState.errors.otp ? s.inputWrapError : {}),
                      }}>
                        <span style={s.inputIcon}><KeyIcon /></span>
                        <input
                          id="reset-otp"
                          type="text"
                          placeholder="Enter 4-digit code"
                          style={s.input}
                          {...resetForm.register("otp")}
                        />
                      </div>
                      {resetForm.formState.errors.otp && (
                        <span style={s.fieldError}>
                          <AlertIcon /> {resetForm.formState.errors.otp.message}
                        </span>
                      )}
                    </div>

                    {/* New Password */}
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="new-password">New Password</label>
                      <div style={{
                        ...s.inputWrap,
                        ...(resetForm.formState.errors.newPassword ? s.inputWrapError : resetForm.formState.touchedFields.newPassword ? s.inputWrapSuccess : {}),
                      }}>
                        <span style={s.inputIcon}><LockIcon /></span>
                        <input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          style={{ ...s.input, paddingRight: 44 }}
                          {...resetForm.register("newPassword")}
                        />
                        <button
                          type="button"
                          id="new-password-toggle"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          style={s.eyeBtn}
                          onClick={() => setShowNewPassword((v) => !v)}
                        >
                          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {resetForm.formState.errors.newPassword && (
                        <span style={s.fieldError}>
                          <AlertIcon /> {resetForm.formState.errors.newPassword.message}
                        </span>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="confirm-password">Confirm New Password</label>
                      <div style={{
                        ...s.inputWrap,
                        ...(resetForm.formState.errors.confirmPassword ? s.inputWrapError : resetForm.formState.touchedFields.confirmPassword ? s.inputWrapSuccess : {}),
                      }}>
                        <span style={s.inputIcon}><LockIcon /></span>
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          style={{ ...s.input, paddingRight: 44 }}
                          {...resetForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          id="confirm-password-toggle"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          style={s.eyeBtn}
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {resetForm.formState.errors.confirmPassword && (
                        <span style={s.fieldError}>
                          <AlertIcon /> {resetForm.formState.errors.confirmPassword.message}
                        </span>
                      )}
                    </div>

                    <button
                      id="set-new-password-btn"
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        ...s.submitBtn,
                        ...(isSubmitting ? s.submitBtnDisabled : {}),
                      }}
                    >
                      {isSubmitting ? (
                        <span style={s.spinnerWrap}>
                          <span style={s.spinner} />
                          Updating Password…
                        </span>
                      ) : (
                        "Set New Password"
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Step 3: Success State */}
              {step === 3 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ display: "inline-flex", marginBottom: 16 }}>
                    <CheckCircleIcon />
                  </div>
                  <h1 style={s.heading}>Password Reset Complete!</h1>
                  <p style={{ ...s.subheading, marginTop: 10, marginBottom: 24 }}>
                    Your password has been updated successfully. You can now sign in with your new credentials.
                  </p>
                  <button
                    id="goto-login-btn"
                    style={s.submitBtn}
                    onClick={() => navigate("/login")}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* Footer navigation */}
              {step !== 3 && (
                <p style={s.footNote}>
                  Remember your password?{" "}
                  <span style={s.footLink} onClick={() => navigate("/login")}>Sign In</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: ILLUSTRATION ══════════ */}
        <div style={s.rightPanel}>
          <div style={s.rightInner}>
            <MedicalSecurityIllustration />
            <p style={s.tagline}>
              Your account security is our top priority.<br />Encrypted data & safe appointments.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bgShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        #reset-identifier::placeholder,
        #reset-otp::placeholder,
        #new-password::placeholder,
        #confirm-password::placeholder {
          color: rgba(103,232,249,0.4);
        }
        #reset-identifier:focus,
        #reset-otp:focus,
        #new-password:focus,
        #confirm-password:focus {
          outline: none;
        }
        #request-code-btn:not(:disabled):hover,
        #set-new-password-btn:not(:disabled):hover,
        #goto-login-btn:hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(91,45,142,0.55);
        }
        #new-password-toggle:hover,
        #confirm-password-toggle:hover {
          color: ${BRAND.cyan} !important;
        }
        @media (max-width: 768px) {
          .ns-left  { padding: 24px 16px !important; }
          .ns-right { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;

/* ── Styles ──────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    background: "#0d1224",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg, #0a0f1e 0%, #0d1224 30%, #12172e 60%, #0d1224 100%)",
    backgroundSize: "400% 400%",
    animation: "bgShift 14s ease infinite",
    zIndex: 0,
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(41,196,224,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(41,196,224,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    zIndex: 0,
  },
  orb: { position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  orb1: { width: 500, height: 500, top: -140, left: -120, background: "radial-gradient(circle, rgba(91,45,142,0.22) 0%, transparent 70%)" },
  orb2: { width: 400, height: 400, bottom: -100, right: -80, background: "radial-gradient(circle, rgba(41,196,224,0.16) 0%, transparent 70%)" },
  orb3: { width: 300, height: 300, top: "40%", left: "48%", background: "radial-gradient(circle, rgba(232,45,124,0.1) 0%, transparent 70%)" },
  layout: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    width: "100%",
    minHeight: "100vh",
  },
  leftPanel: {
    flex: "0 0 auto",
    width: "100%",
    maxWidth: 480,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 48px",
    background: "linear-gradient(135deg, rgba(28,38,70,0.5) 0%, rgba(13,18,36,0.3) 100%)",
    borderLeft: "1px solid rgba(41,196,224,0.1)",
  },
  rightInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
    maxWidth: 420,
  },
  card: {
    width: "100%",
    background: "rgba(28,38,70,0.72)",
    border: "1px solid rgba(41,196,224,0.18)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  },
  accentBar: {
    height: 4,
    background: `linear-gradient(90deg, ${BRAND.purple}, ${BRAND.pink}, ${BRAND.cyan})`,
  },
  cardInner: {
    padding: "36px 36px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },
  logoWrap: { marginBottom: 20 },
  logoBox: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "10px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "inline-flex",
    alignItems: "center",
  },
  titleGroup: { textAlign: "center", marginBottom: 24, width: "100%" },
  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  subheading: {
    margin: "6px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
    color: `${BRAND.cyanLight}`,
    opacity: 0.75,
  },
  errorBanner: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fca5a5",
    fontSize: 14,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 16,
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: `${BRAND.cyanLight}`,
    marginBottom: 6,
    letterSpacing: "0.02em",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(41,196,224,0.25)",
    borderRadius: 12,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputWrapError: {
    borderColor: "rgba(239,68,68,0.6)",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
  },
  inputWrapSuccess: {
    borderColor: "rgba(34,197,94,0.5)",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    color: BRAND.cyan,
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    opacity: 0.8,
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f1f5f9",
    fontSize: 15,
    padding: "13px 14px 13px 40px",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(103,232,249,0.55)",
    display: "flex",
    alignItems: "center",
    padding: 4,
    borderRadius: 6,
    transition: "color 0.2s",
  },
  fieldError: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    color: "#fca5a5",
    fontSize: 12,
    marginTop: 5,
    fontWeight: 500,
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.pink} 100%)`,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 8,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(91,45,142,0.4)",
    letterSpacing: "0.02em",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  spinnerWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footNote: {
    marginTop: 20,
    marginBottom: 0,
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
  },
  footLink: {
    color: BRAND.cyan,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },
  tagline: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    lineHeight: 1.7,
    margin: 0,
  },
};
