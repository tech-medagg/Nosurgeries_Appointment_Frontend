import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import brandLogo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { BRAND } from "../../theme/theme";

/* ── Validation ───────────────────────────────────────── */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Admin email or mobile number is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
        /^\+?[0-9\s\-()]{10,20}$/.test(val),
      "Enter a valid admin email address or 10-digit mobile number"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ── Icons ────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

/* ── Illustration ─────────────────────────────────────── */
const AdminIllustration = () => (
  <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 360, filter: "drop-shadow(0 20px 60px rgba(168,85,247,0.25))" }}>
    <ellipse cx="200" cy="300" rx="160" ry="120" fill="rgba(168,85,247,0.08)" />
    <ellipse cx="200" cy="300" rx="100" ry="75" fill="rgba(91,45,142,0.15)" />
    
    {/* Console Card */}
    <rect x="50" y="140" width="300" height="260" rx="16" fill="#1c2646" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" />
    <rect x="50" y="140" width="300" height="36" rx="16" fill="#28355c" />
    
    {/* Header Dots */}
    <circle cx="75" cy="158" r="5" fill="#ef4444" />
    <circle cx="92" cy="158" r="5" fill="#eab308" />
    <circle cx="109" cy="158" r="5" fill="#22c55e" />
    <text x="200" y="163" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">
      Sumi-Admin Control Console
    </text>

    {/* Metric Cards */}
    <rect x="70" y="195" width="120" height="65" rx="8" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="1" />
    <text x="85" y="220" fill="#c084fc" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Total Appointments</text>
    <text x="85" y="246" fill="#ffffff" fontSize="20" fontWeight="800" fontFamily="Inter,sans-serif">1,428</text>

    <rect x="210" y="195" width="120" height="65" rx="8" fill="rgba(41,196,224,0.15)" stroke="rgba(41,196,224,0.4)" strokeWidth="1" />
    <text x="225" y="220" fill={BRAND.cyan} fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Active Doctors</text>
    <text x="225" y="246" fill="#ffffff" fontSize="20" fontWeight="800" fontFamily="Inter,sans-serif">84</text>

    {/* System Status Table Strip */}
    <rect x="70" y="275" width="260" height="100" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <text x="85" y="300" fill="rgba(255,255,255,0.5)" fontSize="10" fontWeight="600" fontFamily="Inter,sans-serif">SYSTEM STATUS</text>
    <circle cx="295" cy="296" r="4" fill="#22c55e">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
    </circle>
    <text x="305" y="300" fill="#22c55e" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">LIVE</text>

    <line x1="70" y1="312" x2="330" y2="312" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <text x="85" y="335" fill="#f1f5f9" fontSize="11" fontFamily="Inter,sans-serif">PostgreSQL Neon DB</text>
    <text x="285" y="335" fill="#4ade80" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Connected</text>

    <text x="85" y="358" fill="#f1f5f9" fontSize="11" fontFamily="Inter,sans-serif">Role Verification</text>
    <text x="290" y="358" fill="#c084fc" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Enforced</text>

    {/* Title */}
    <text x="200" y="80" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter,sans-serif">Sumi-Admin</text>
    <text x="200" y="105" textAnchor="middle" fill="#c084fc" fontSize="12" fontFamily="Inter,sans-serif" opacity="0.9">
      Healthcare Administration Suite
    </text>
  </svg>
);

const StatBadge = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${color}35`,
    borderRadius: 12,
    padding: "10px 18px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
  }}>
    <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3, fontWeight: 500 }}>{label}</div>
  </div>
);

/* ════════════════════════════════════════════════════════
   SUMI-ADMIN LOGIN PAGE
═══════════════════════════════════════════════════════ */
export default function SumiAdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await login(values);
      // Admin login navigates straight to admin dashboard
      navigate("/admin", { replace: true });
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; message?: string };
      setServerError(
        e?.response?.data?.message || e?.message || "Unable to login. Please check admin credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickAdmin = () => {
    setValue("identifier", "admin@test.com", { shouldValidate: true });
    setValue("password", "12345678", { shouldValidate: true });
  };

  return (
    <div style={s.root}>
      {/* Background gradients */}
      <div style={s.bg} />
      <div style={s.grid} />
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

      <div style={s.layout}>
        {/* ══ LEFT: FORM ══ */}
        <div style={s.leftPanel}>
          <div style={s.card}>
            {/* Top purple/cyan accent bar */}
            <div style={s.accentBar} />

            <div style={s.cardInner}>
              {/* Logo & Portal Badge */}
              <div style={s.logoWrap}>
                <div style={s.logoBox}>
                  <img src={brandLogo} alt="NoSurgeries" style={{ height: 42, width: "auto", objectFit: "contain" }} />
                </div>
              </div>

              <div style={s.badge}>
                <ShieldIcon />
                <span>Sumi-Admin Portal</span>
              </div>

              <div style={s.titleGroup}>
                <h1 style={s.heading}>Admin Sign In</h1>
                <p style={s.subheading}>Enter administrative credentials to access console</p>
              </div>

              {/* Server error banner */}
              {serverError && (
                <div style={s.errorBanner}>
                  <AlertIcon />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: "100%" }}>
                {/* Email or Mobile */}
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="admin-identifier">Admin Email or Mobile</label>
                  <div style={{
                    ...s.inputWrap,
                    ...(errors.identifier ? s.inputWrapError : touchedFields.identifier ? s.inputWrapSuccess : {}),
                  }}>
                    <span style={s.inputIcon}><UserIcon /></span>
                    <input
                      id="admin-identifier"
                      type="text"
                      placeholder="admin@test.com or 9344228004"
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
                  <label style={s.label} htmlFor="admin-password">Password</label>
                  <div style={{
                    ...s.inputWrap,
                    ...(errors.password ? s.inputWrapError : touchedFields.password ? s.inputWrapSuccess : {}),
                  }}>
                    <span style={s.inputIcon}><LockIcon /></span>
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                      style={{ ...s.input, paddingRight: 44 }}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      id="admin-password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={s.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                    <span
                      id="admin-forgot-pw"
                      style={{ fontSize: 13, fontWeight: 600, color: "#c084fc", cursor: "pointer" }}
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

                {/* Submit button */}
                <button
                  id="admin-login-submit"
                  type="submit"
                  disabled={isSubmitting}
                  style={{ ...s.submitBtn, ...(isSubmitting ? s.submitBtnDisabled : {}) }}
                >
                  {isSubmitting ? (
                    <span style={s.spinnerWrap}>
                      <span style={s.spinner} />
                      Authenticating…
                    </span>
                  ) : (
                    "Sign In to Sumi-Admin"
                  )}
                </button>

                {/* Quick Auto-Fill for Admin */}
                <button
                  type="button"
                  onClick={fillQuickAdmin}
                  style={s.quickFillBtn}
                >
                  ⚡ Auto-Fill Test Admin (admin@test.com)
                </button>
              </form>

              {/* Navigation Links */}
              <div style={{ marginTop: 20, textAlign: "center", width: "100%" }}>
                <p style={s.footNote}>
                  Need a new admin account?{" "}
                  <span style={s.footLink} onClick={() => navigate("/sumi-admin/register")}>
                    Register Sumi-Admin
                  </span>
                </p>
                <p style={{ ...s.footNote, marginTop: 8, fontSize: 12, opacity: 0.6 }}>
                  Looking for patient / doctor login?{" "}
                  <span style={{ color: BRAND.cyan, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>
                    Main Login Portal
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT: ILLUSTRATION ══ */}
        <div style={s.rightPanel}>
          <div style={s.rightInner}>
            <AdminIllustration />
            <div style={s.statsRow}>
              <StatBadge value="100%" label="Uptime" color="#c084fc" />
              <StatBadge value="Admin" label="Console" color={BRAND.cyan} />
              <StatBadge value="Secure" label="Role Guard" color={BRAND.pink} />
            </div>
            <p style={s.tagline}>
              Sumi-Admin · Unified Hospital &amp; Doctor Management for NoSurgeries.
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
        #admin-identifier::placeholder, #admin-password::placeholder { color: rgba(192, 132, 252, 0.4); }
        #admin-identifier:focus, #admin-password:focus { outline: none; }
        #admin-login-submit:not(:disabled):hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(168, 85, 247, 0.55);
        }
        #admin-password-toggle:hover { color: #c084fc !important; }
        @media (max-width: 768px) {
          .ns-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "stretch",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    background: "#0a0d1a",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg, #090c19 0%, #101426 30%, #141731 60%, #090c19 100%)",
    backgroundSize: "400% 400%",
    animation: "bgShift 14s ease infinite",
    zIndex: 0,
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    zIndex: 0,
  },
  orb: { position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0 },
  orb1: { width: 520, height: 520, top: -140, left: -120, background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)" },
  orb2: { width: 420, height: 420, bottom: -100, right: -80, background: "radial-gradient(circle, rgba(91,45,142,0.2) 0%, transparent 70%)" },
  orb3: { width: 320, height: 320, top: "40%", left: "48%", background: "radial-gradient(circle, rgba(41,196,224,0.12) 0%, transparent 70%)" },
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
    borderLeft: "1px solid rgba(168,85,247,0.15)",
  },
  rightInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 32, maxWidth: 420 },
  card: {
    width: "100%",
    background: "rgba(22, 27, 50, 0.78)",
    border: "1px solid rgba(168,85,247,0.28)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  },
  accentBar: {
    height: 4,
    background: `linear-gradient(90deg, #c084fc, ${BRAND.purple}, ${BRAND.cyan})`,
  },
  cardInner: { padding: "32px 36px 28px", display: "flex", flexDirection: "column", alignItems: "center" },
  logoWrap: { marginBottom: 14 },
  logoBox: {
    background: "#ffffff",
    borderRadius: 14,
    padding: "10px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "inline-flex",
    alignItems: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 20,
    background: "rgba(168,85,247,0.15)",
    border: "1px solid rgba(168,85,247,0.35)",
    color: "#c084fc",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  titleGroup: { textAlign: "center", marginBottom: 20, width: "100%" },
  heading: { margin: 0, fontSize: 26, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px" },
  subheading: { margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" },
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
    fontSize: 13,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  fieldGroup: { width: "100%", marginBottom: 14, boxSizing: "border-box" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6, letterSpacing: "0.02em" },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(168,85,247,0.3)",
    borderRadius: 12,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputWrapError: { borderColor: "rgba(239,68,68,0.6)", boxShadow: "0 0 0 3px rgba(239,68,68,0.1)" },
  inputWrapSuccess: { borderColor: "rgba(34,197,94,0.5)" },
  inputIcon: { position: "absolute", left: 13, color: "#c084fc", display: "flex", alignItems: "center", pointerEvents: "none" },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: 14,
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
    color: "rgba(192,132,252,0.6)",
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
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #d946ef 100%)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 8,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
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
  quickFillBtn: {
    width: "100%",
    marginTop: 10,
    padding: "10px",
    background: "rgba(168,85,247,0.12)",
    border: "1px dashed rgba(168,85,247,0.45)",
    borderRadius: 10,
    color: "#d8b4fe",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footNote: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" },
  footLink: { color: "#c084fc", fontWeight: 700, cursor: "pointer" },
  statsRow: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  tagline: { textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, margin: 0 },
};
