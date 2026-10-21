import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import brandLogo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { BRAND } from "../../theme/theme";
import { googleLoginApi } from "../../services/auth.api";
import { GoogleOAuthModal } from "../../components/auth/GoogleOAuthModal";

/* ── Validation ───────────────────────────────────────── */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
        /^\+?[0-9\s\-()]{10,20}$/.test(val),
      "Enter a valid email address or 10-digit mobile number"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ── Icon helpers ─────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

/* ── Medical illustration ─────────────────────────────── */
const MedicalIllustration = () => (
  <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 360, filter: "drop-shadow(0 20px 60px rgba(41,196,224,0.25))" }}>
    <ellipse cx="200" cy="300" rx="160" ry="120" fill="rgba(41,196,224,0.07)" />
    <ellipse cx="200" cy="300" rx="100" ry="75" fill="rgba(91,45,142,0.1)" />
    <rect x="60" y="180" width="280" height="240" rx="12" fill="#1c2646" stroke="rgba(41,196,224,0.3)" strokeWidth="1.5" />
    <rect x="60" y="155" width="280" height="30" rx="6" fill="#28355c" />
    <rect x="178" y="165" width="44" height="12" rx="3" fill={BRAND.cyan} opacity="0.9" />
    <rect x="194" y="158" width="12" height="26" rx="3" fill={BRAND.cyan} opacity="0.9" />
    {[100, 160, 230, 290].map((x, i) =>
      [210, 260, 310].map((y, j) => (
        <rect key={`w${i}${j}`} x={x} y={y} width="36" height="28" rx="4"
          fill={j === 0 ? "rgba(41,196,224,0.25)" : "rgba(28,38,70,0.6)"}
          stroke="rgba(41,196,224,0.2)" strokeWidth="1" />
      ))
    )}
    <rect x="168" y="360" width="64" height="60" rx="6" fill="#28355c" stroke="rgba(41,196,224,0.3)" strokeWidth="1" />
    <circle cx="224" cy="392" r="4" fill={BRAND.cyan} opacity="0.7" />
    <path d="M100 130 C100 170, 130 185, 155 205 C180 225, 210 225, 210 205 C210 185, 190 185, 190 205"
      stroke={BRAND.cyan} strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="100" cy="126" r="9" fill={BRAND.cyan} opacity="0.85" />
    <circle cx="126" cy="126" r="9" fill={BRAND.cyan} opacity="0.85" />
    <circle cx="190" cy="208" r="16" fill={BRAND.purple} opacity="0.9" />
    <circle cx="190" cy="208" r="9" fill="#fff" opacity="0.3" />
    <circle cx="190" cy="208" r="16" stroke={BRAND.cyan} strokeWidth="2" fill="none" opacity="0.6">
      <animate attributeName="r" values="16;26;16" dur="2.2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
    </circle>
    <rect x="310" y="110" width="30" height="10" rx="3" fill={BRAND.pink} opacity="0.7" />
    <rect x="320" y="100" width="10" height="30" rx="3" fill={BRAND.pink} opacity="0.7" />
    <rect x="55" y="310" width="40" height="20" rx="10" fill={BRAND.purple} opacity="0.6" />
    <line x1="75" y1="310" x2="75" y2="330" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <polyline points="60,460 90,460 100,440 112,475 124,445 136,460 160,460"
      fill="none" stroke={BRAND.cyan} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <text x="200" y="100" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="Inter,sans-serif" opacity="0.9">NoSurgeries</text>
    <text x="200" y="122" textAnchor="middle" fill={BRAND.cyan} fontSize="11" fontFamily="Inter,sans-serif" opacity="0.7">Healthcare Appointment Platform</text>
  </svg>
);

const StatBadge = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${color}30`,
    borderRadius: 12,
    padding: "10px 18px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
  }}>
    <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3, fontWeight: 500 }}>{label}</div>
  </div>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const hasGoogleAuth = Boolean(
  GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_ID.trim().length > 10 &&
    !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE")
);

/* ════════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════ */
const LoginPageInner = () => {
  const navigate = useNavigate();
  const { login, setAuthSession } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleModalError, setGoogleModalError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onTouched",
  });

  const redirectAfterLogin = (user?: any) => {
    const stored = localStorage.getItem("authUser");
    const authUser = user || (stored ? JSON.parse(stored) : null);
    const role = authUser?.roleName ?? "PATIENT";
    if (role === "DOCTOR") {
      navigate("/doctor", { replace: true });
    } else if (["ADMIN", "SUPER_ADMIN", "COORDINATOR"].includes(role)) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/patient", { replace: true });
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await login(values);
      redirectAfterLogin();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; message?: string };
      setServerError(
        e?.response?.data?.message || e?.message || "Unable to login. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setServerError("Google authentication failed. No token received.");
      return;
    }
    setServerError("");
    setGoogleLoading(true);
    try {
      const result = await googleLoginApi({ credential: credentialResponse.credential });
      if (result.requiresRoleSelection) {
        sessionStorage.setItem("googlePendingUser", JSON.stringify(result.data));
        navigate("/register?google=1");
        return;
      }
      if (result.success && result.data) {
        setAuthSession(result.data.accessToken, result.data.user);
        redirectAfterLogin(result.data.user);
      } else {
        setServerError(result.message ?? "Google login failed.");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setServerError(e?.response?.data?.message ?? "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOAuthModalAuthenticate = async (account: {
    email: string;
    name: string;
    roleName: "PATIENT" | "DOCTOR";
  }) => {
    setGoogleModalError("");
    setGoogleLoading(true);
    try {
      // Safe base64 encode that handles unicode characters
      const safeB64 = (str: string) =>
        btoa(
          encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );

      // Generate a deterministic but safe googleId from the email
      const emailHash = account.email
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const safeId = "google_" + Math.abs(emailHash).toString(36) + "_" + Date.now();

      const demoPayload = {
        email: account.email.trim(),
        name: account.name.trim() || account.email.split("@")[0],
        googleId: safeId,
      };

      const b64 = safeB64(JSON.stringify(demoPayload));
      const credential = "demo_oauth_" + b64;

      const result = await googleLoginApi({
        credential,
        roleName: account.roleName,
      });

      if (result.requiresRoleSelection) {
        sessionStorage.setItem("googlePendingUser", JSON.stringify(result.data));
        setIsGoogleModalOpen(false);
        navigate("/register?google=1");
        return;
      }

      if (result.success && result.data) {
        setAuthSession(result.data.accessToken, result.data.user);
        setIsGoogleModalOpen(false);
        redirectAfterLogin(result.data.user);
      } else {
        setGoogleModalError(result.message ?? "Google authentication failed.");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setGoogleModalError(
        e?.response?.data?.message ?? "Google sign in failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillQuickLogin = (identifier: string, pass: string) => {
    setValue("identifier", identifier, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
  };

  return (
    <div style={s.root}>
      {/* animated gradient BG */}
      <div style={s.bg} />
      <div style={s.grid} />
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

      <div style={s.layout}>
        {/* ══════════ LEFT: FORM ══════════ */}
        <div style={s.leftPanel}>
          <div style={s.card}>
            {/* top accent bar */}
            <div style={s.accentBar} />

            <div style={s.cardInner}>
              {/* Logo */}
              <div style={s.logoWrap}>
                <div style={s.logoBox}>
                  <img src={brandLogo} alt="NoSurgeries" style={{ height: 44, width: "auto", objectFit: "contain" }} />
                </div>
              </div>

              <div style={s.titleGroup}>
                <h1 style={s.heading}>Welcome Back</h1>
                <p style={s.subheading}>Sign in to your NoSurgeries account</p>
              </div>

              {/* Google OAuth (Set SHOW_GOOGLE_AUTH to true whenever you want to display it again) */}
              {(() => {
                const SHOW_GOOGLE_AUTH = false;
                if (!SHOW_GOOGLE_AUTH) return null;
                return (
                  <>
                    <div style={s.googleWrap}>
                      {googleLoading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                          <span style={s.spinner} /> Signing in with Google…
                        </div>
                      ) : hasGoogleAuth ? (
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setServerError("Google sign-in was cancelled or failed.")}
                          useOneTap={false}
                          text="signin_with"
                          theme="filled_black"
                          shape="rectangular"
                          size="large"
                          width="340"
                        />
                      ) : (
                        <button
                          id="google-custom-btn"
                          type="button"
                          onClick={() => {
                            setGoogleModalError("");
                            setIsGoogleModalOpen(true);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            padding: "11px 16px",
                            background: "rgba(255, 255, 255, 0.07)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: 10,
                            color: "#ffffff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <GoogleIcon />
                          <span>Sign in with Google</span>
                        </button>
                      )}
                    </div>

                    {/* Divider */}
                    <div style={s.dividerRow}>
                      <span style={s.dividerLine} />
                      <span style={s.dividerTxt}>Or sign in with credentials</span>
                      <span style={s.dividerLine} />
                    </div>
                  </>
                );
              })()}

              {/* Server error */}
              {serverError && (
                <div style={s.errorBanner}>
                  <AlertIcon />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: "100%" }}>
                {/* Email or Mobile */}
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="login-identifier">Email or Mobile Number</label>
                  <div style={{
                    ...s.inputWrap,
                    ...(errors.identifier ? s.inputWrapError : touchedFields.identifier ? s.inputWrapSuccess : {}),
                  }}>
                    <span style={s.inputIcon}><UserIcon /></span>
                    <input
                      id="login-identifier"
                      type="text"
                      placeholder="name@email.com or +91 98765 43210"
                      autoComplete="username"
                      style={s.input}
                      {...register("identifier")}
                    />
                  </div>
                  {errors.identifier && (
                    <span style={s.fieldError}>
                      <AlertIcon /> {errors.identifier.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="login-password">Password</label>
                  <div style={{
                    ...s.inputWrap,
                    ...(errors.password ? s.inputWrapError : touchedFields.password ? s.inputWrapSuccess : {}),
                  }}>
                    <span style={s.inputIcon}><LockIcon /></span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ ...s.input, paddingRight: 44 }}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      id="login-password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={s.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                    <span
                      id="forgot-password-link"
                      style={{ fontSize: 13, fontWeight: 600, color: BRAND.cyan, cursor: "pointer" }}
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot password?
                    </span>
                  </div>
                  {errors.password && (
                    <span style={s.fieldError}>
                      <AlertIcon /> {errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  style={{ ...s.submitBtn, ...(isSubmitting ? s.submitBtnDisabled : {}) }}
                >
                  {isSubmitting ? (
                    <span style={s.spinnerWrap}>
                      <span style={s.spinner} />
                      Signing in…
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Quick Test Accounts for 3 Dashboards */}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Quick Test Login (3 Dashboards)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => fillQuickLogin("patient@test.com", "12345678")}
                      style={{
                        padding: "7px 4px",
                        background: "rgba(41, 196, 224, 0.12)",
                        border: "1px solid rgba(41, 196, 224, 0.35)",
                        borderRadius: 8,
                        color: BRAND.cyan,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      👤 Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickLogin("doctor@test.com", "12345678")}
                      style={{
                        padding: "7px 4px",
                        background: "rgba(232, 45, 124, 0.12)",
                        border: "1px solid rgba(232, 45, 124, 0.35)",
                        borderRadius: 8,
                        color: BRAND.pink,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🩺 Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickLogin("admin@test.com", "12345678")}
                      style={{
                        padding: "7px 4px",
                        background: "rgba(168, 85, 247, 0.12)",
                        border: "1px solid rgba(168, 85, 247, 0.35)",
                        borderRadius: 8,
                        color: "#c084fc",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🛡️ Admin
                    </button>
                  </div>
                </div>
              </form>

              <p style={s.footNote}>
                Don't have an account?{" "}
                <span style={s.footLink} onClick={() => navigate("/register")}>Register</span>
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: ILLUSTRATION ══════════ */}
        <div style={s.rightPanel}>
          <div style={s.rightInner}>
            <MedicalIllustration />
            <div style={s.statsRow}>
              <StatBadge value="50k+" label="Patients" color={BRAND.cyan} />
              <StatBadge value="200+" label="Hospitals" color={BRAND.pink} />
              <StatBadge value="1k+" label="Doctors" color={BRAND.purpleLight} />
            </div>
            <p style={s.tagline}>
              Skip the waiting room.<br />Book your appointment in seconds.
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
        @keyframes spin { to { transform: rotate(360deg); } }
        #login-identifier::placeholder, #login-password::placeholder { color: rgba(103,232,249,0.4); }
        #login-identifier:focus, #login-password:focus { outline: none; }
        #login-submit-btn:not(:disabled):hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(91,45,142,0.55);
        }
        #login-password-toggle:hover { color: ${BRAND.cyan} !important; }
        @media (max-width: 768px) {
          .ns-layout { flex-direction: column !important; }
          .ns-right  { display: none !important; }
          .ns-left   { padding: 24px 16px !important; }
        }
      `}</style>

      {/* Google OAuth Account Chooser Modal */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onAuthenticate={handleOAuthModalAuthenticate}
        isLoading={googleLoading}
        errorMessage={googleModalError}
      />
    </div>
  );
};

const LoginPage = () => {
  if (hasGoogleAuth) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPageInner />
      </GoogleOAuthProvider>
    );
  }
  return <LoginPageInner />;
};

export default LoginPage;

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
  layout: { position: "relative", zIndex: 1, display: "flex", width: "100%", minHeight: "100vh" },
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
  rightInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 32, maxWidth: 420 },
  card: {
    width: "100%",
    background: "rgba(28,38,70,0.7)",
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
  cardInner: { padding: "32px 36px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 },
  logoWrap: { marginBottom: 18 },
  logoBox: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "10px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "inline-flex",
    alignItems: "center",
  },
  titleGroup: { textAlign: "center", marginBottom: 20, width: "100%" },
  heading: { margin: 0, fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" },
  subheading: { margin: "6px 0 0", fontSize: 14, color: `${BRAND.cyanLight}`, opacity: 0.75 },
  googleWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: 4,
    minHeight: 44,
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
  fieldGroup: { width: "100%", marginBottom: 14, boxSizing: "border-box" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: `${BRAND.cyanLight}`, marginBottom: 6, letterSpacing: "0.02em" },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(41,196,224,0.25)",
    borderRadius: 12,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputWrapError: { borderColor: "rgba(239,68,68,0.6)", boxShadow: "0 0 0 3px rgba(239,68,68,0.1)" },
  inputWrapSuccess: { borderColor: "rgba(34,197,94,0.5)" },
  inputIcon: { position: "absolute", left: 13, color: BRAND.cyan, display: "flex", alignItems: "center", pointerEvents: "none", opacity: 0.8 },
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
  fieldError: { display: "inline-flex", alignItems: "center", gap: 4, color: "#fca5a5", fontSize: 12, marginTop: 5, fontWeight: 500 },
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
  submitBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  spinnerWrap: { display: "inline-flex", alignItems: "center", gap: 8 },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footNote: { marginTop: 18, marginBottom: 0, fontSize: 14, color: "rgba(255,255,255,0.45)", textAlign: "center" },
  footLink: { color: BRAND.cyan, fontWeight: 700, cursor: "pointer" },
  dividerRow: { display: "flex", alignItems: "center", gap: 10, width: "100%", margin: "14px 0 16px" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  dividerTxt: { fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" },
  statsRow: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  tagline: { textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, margin: 0 },
};
