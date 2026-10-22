import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import brandLogo from "../../assets/logo.png";
import { BRAND } from "../../theme/theme";
import { registerApi } from "../../services/auth.api";

/* ── Validation schema ──────────────────────────────── */
const adminRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Full name must not exceed 100 characters")
      .regex(/^[a-zA-Z\s.'-]+$/, "Full name should only contain letters and spaces"),
    email: z
      .string()
      .trim()
      .min(1, "Admin email address is required")
      .email("Enter a valid email address (e.g. admin@nosurgeries.com)"),
    mobile: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^[+]?[0-9\s-]{10,18}$/, "Enter a valid mobile number")
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          return digits.length >= 10 && digits.length <= 15;
        },
        { message: "Mobile number must be at least 10 digits" }
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter (A-Z)")
      .regex(/[0-9]/, "Must contain at least 1 number (0-9)"),
    confirm: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;

/* ── Inline SVG Icons ──────────────────────────────── */
const UserIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>;
const LockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const EyeIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const AlertIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Illustration ──────────────────────────────────── */
const AdminRegIllustration = () => (
  <svg viewBox="0 0 400 520" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", maxWidth: 360, filter: "drop-shadow(0 20px 60px rgba(168,85,247,0.25))" }}>
    <ellipse cx="200" cy="300" rx="170" ry="130" fill="rgba(168,85,247,0.08)" />
    <ellipse cx="200" cy="290" rx="100" ry="80" fill="rgba(91,45,142,0.12)" />

    {/* Admin Card */}
    <rect x="50" y="80" width="300" height="260" rx="18" fill="#1c2646" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />
    <rect x="50" y="80" width="300" height="44" rx="18" fill="#28355c" />
    
    <circle cx="80" cy="102" r="12" fill={BRAND.purple} opacity="0.85" />
    <text x="80" y="106" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">🛡️</text>
    <text x="105" y="106" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">Sumi-Admin Access Privileges</text>

    {/* Permission Rows */}
    {[
      { label: "Manage Hospitals & Departments", color: "#4ade80" },
      { label: "Approve & Schedule Doctors", color: "#c084fc" },
      { label: "Oversee Patient Appointments", color: BRAND.cyan },
      { label: "Generate Analytics & Reports", color: BRAND.pink },
    ].map((perm, idx) => (
      <g key={idx}>
        <rect x="70" y={140 + idx * 42} width="260" height="34" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <circle cx="86" cy={157 + idx * 42} r="6" fill={perm.color} opacity="0.3" />
        <circle cx="86" cy={157 + idx * 42} r="3" fill={perm.color} />
        <text x="104" y={161 + idx * 42} fill="#f1f5f9" fontSize="11" fontWeight="500" fontFamily="Inter,sans-serif">
          {perm.label}
        </text>
      </g>
    ))}

    {/* Security Strip */}
    <rect x="50" y="360" width="300" height="70" rx="14" fill="#1e2d54" stroke="rgba(168,85,247,0.2)" strokeWidth="1" />
    <text x="75" y="388" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Security Level</text>
    <text x="75" y="412" fill="#c084fc" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">ROLE: ADMIN (Full Control)</text>
    <rect x="260" y="380" width="65" height="26" rx="6" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" />
    <text x="292" y="397" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">ACTIVE</text>

    <text x="200" y="48" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter,sans-serif">Sumi-Admin Onboarding</text>
    <text x="200" y="66" textAnchor="middle" fill="#c084fc" fontSize="11" fontFamily="Inter,sans-serif">Authorized Personnel Only</text>
  </svg>
);

/* ── Password strength bar ─────────────────────────── */
function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: -8, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 4,
              background: i <= score ? colors[score - 1] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : "transparent", fontWeight: 600 }}>
        {score > 0 && labels[score - 1]}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SUMI-ADMIN REGISTER PAGE
═══════════════════════════════════════════════════════ */
export default function SumiAdminRegisterPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      confirm: "",
    },
    mode: "onTouched",
  });

  const pw = watch("password");

  const onSubmit = async (values: AdminRegisterFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      const cleanMobile = values.mobile.replace(/[\s-]/g, "");
      const res = await registerApi({
        roleName: "ADMIN",
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        mobile: cleanMobile,
        password: values.password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate("/sumi-admin/login"), 2000);
      } else {
        setServerError(res.message || "Admin registration failed.");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setServerError(
        err?.response?.data?.message || err?.message || "Admin registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.grid} />
      <div style={{ ...s.orb, ...s.orb1 }} />
      <div style={{ ...s.orb, ...s.orb2 }} />
      <div style={{ ...s.orb, ...s.orb3 }} />

      <div style={s.layout}>
        {/* ══ LEFT: FORM ══ */}
        <div style={s.leftPanel}>
          <div style={s.card}>
            <div style={s.accentBar} />

            {success ? (
              <div style={s.successBox}>
                <div style={s.successIcon}><CheckIcon /></div>
                <h2 style={{ ...s.heading, marginBottom: 8 }}>Admin Account Created!</h2>
                <p style={{ ...s.subheading, marginBottom: 0 }}>
                  Redirecting to Sumi-Admin login portal…
                </p>
              </div>
            ) : (
              <div style={s.cardInner}>
                {/* Logo & Badge */}
                <div style={s.logoWrap}>
                  <div style={s.logoBox}>
                    <img src={brandLogo} alt="NoSurgeries" style={{ height: 42, width: "auto", objectFit: "contain" }} />
                  </div>
                </div>

                <div style={s.badge}>
                  <ShieldIcon />
                  <span>Sumi-Admin Registration</span>
                </div>

                <div style={s.titleGroup}>
                  <h1 style={s.heading}>Create Admin Account</h1>
                  <p style={s.subheading}>Register an authorized administrator for NoSurgeries</p>
                </div>

                {serverError && (
                  <div style={s.errorBanner}>
                    <AlertIcon />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: "100%" }}>
                  {/* Full Name */}
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-reg-name">Administrator Full Name</label>
                    <div style={{
                      ...s.inputWrap,
                      ...(errors.fullName ? s.inputWrapError : touchedFields.fullName ? s.inputWrapSuccess : {}),
                    }}>
                      <span style={s.inputIcon}><UserIcon /></span>
                      <input
                        id="admin-reg-name"
                        type="text"
                        placeholder="e.g. Sumi Admin / John Doe"
                        autoComplete="name"
                        style={s.input}
                        {...register("fullName")}
                      />
                    </div>
                    {errors.fullName && (
                      <span style={s.fieldError}><AlertIcon /> {errors.fullName.message}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-reg-email">Admin Email Address</label>
                    <div style={{
                      ...s.inputWrap,
                      ...(errors.email ? s.inputWrapError : touchedFields.email ? s.inputWrapSuccess : {}),
                    }}>
                      <span style={s.inputIcon}><MailIcon /></span>
                      <input
                        id="admin-reg-email"
                        type="email"
                        placeholder="admin@nosurgeries.com"
                        autoComplete="email"
                        style={s.input}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <span style={s.fieldError}><AlertIcon /> {errors.email.message}</span>
                    )}
                  </div>

                  {/* Mobile */}
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-reg-mobile">Mobile Number</label>
                    <div style={{
                      ...s.inputWrap,
                      ...(errors.mobile ? s.inputWrapError : touchedFields.mobile ? s.inputWrapSuccess : {}),
                    }}>
                      <span style={s.inputIcon}><PhoneIcon /></span>
                      <input
                        id="admin-reg-mobile"
                        type="tel"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        style={s.input}
                        {...register("mobile")}
                      />
                    </div>
                    {errors.mobile && (
                      <span style={s.fieldError}><AlertIcon /> {errors.mobile.message}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-reg-pw">Password</label>
                    <div style={{
                      ...s.inputWrap,
                      ...(errors.password ? s.inputWrapError : touchedFields.password ? s.inputWrapSuccess : {}),
                    }}>
                      <span style={s.inputIcon}><LockIcon /></span>
                      <input
                        id="admin-reg-pw"
                        type={showPw ? "text" : "password"}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        style={{ ...s.input, paddingRight: 44 }}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        id="admin-reg-pw-toggle"
                        aria-label="Toggle password"
                        style={s.eyeBtn}
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.password && (
                      <span style={s.fieldError}><AlertIcon /> {errors.password.message}</span>
                    )}
                  </div>

                  <StrengthBar password={pw} />

                  {/* Dynamic Requirements Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, marginTop: -4 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: pw.length >= 8 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: pw.length >= 8 ? "#4ade80" : "rgba(255,255,255,0.45)",
                      border: `1px solid ${pw.length >= 8 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                    }}>
                      {pw.length >= 8 ? "✓" : "○"} 8+ chars
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: /[A-Z]/.test(pw) ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: /[A-Z]/.test(pw) ? "#4ade80" : "rgba(255,255,255,0.45)",
                      border: `1px solid ${/[A-Z]/.test(pw) ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                    }}>
                      {/[A-Z]/.test(pw) ? "✓" : "○"} 1 uppercase
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: /[0-9]/.test(pw) ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: /[0-9]/.test(pw) ? "#4ade80" : "rgba(255,255,255,0.45)",
                      border: `1px solid ${/[0-9]/.test(pw) ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                    }}>
                      {/[0-9]/.test(pw) ? "✓" : "○"} 1 number
                    </span>
                  </div>

                  {/* Confirm Password */}
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-reg-cf">Confirm Password</label>
                    <div style={{
                      ...s.inputWrap,
                      ...(errors.confirm ? s.inputWrapError : touchedFields.confirm ? s.inputWrapSuccess : {}),
                    }}>
                      <span style={s.inputIcon}><ShieldIcon /></span>
                      <input
                        id="admin-reg-cf"
                        type={showCf ? "text" : "password"}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        style={{ ...s.input, paddingRight: 44 }}
                        {...register("confirm")}
                      />
                      <button
                        type="button"
                        id="admin-reg-cf-toggle"
                        aria-label="Toggle confirm"
                        style={s.eyeBtn}
                        onClick={() => setShowCf((v) => !v)}
                      >
                        {showCf ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.confirm && (
                      <span style={s.fieldError}><AlertIcon /> {errors.confirm.message}</span>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    id="admin-reg-submit"
                    type="submit"
                    disabled={isSubmitting}
                    style={{ ...s.submitBtn, ...(isSubmitting ? s.submitBtnDisabled : {}) }}
                  >
                    {isSubmitting ? (
                      <span style={s.spinnerWrap}>
                        <span style={s.spinner} />
                        Creating Admin Account…
                      </span>
                    ) : (
                      "Register as Sumi-Admin"
                    )}
                  </button>
                </form>

                {/* Footnotes */}
                <div style={{ marginTop: 18, textAlign: "center", width: "100%" }}>
                  <p style={s.footNote}>
                    Already have an admin account?{" "}
                    <span style={s.footLink} onClick={() => navigate("/sumi-admin/login")}>
                      Sign In
                    </span>
                  </p>
                  <p style={{ ...s.footNote, marginTop: 8, fontSize: 12, opacity: 0.6 }}>
                    Not an administrator?{" "}
                    <span style={{ color: BRAND.cyan, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/register")}>
                      Patient / Doctor Registration
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: ILLUSTRATION ══ */}
        <div style={s.rightPanel}>
          <div style={s.rightInner}>
            <AdminRegIllustration />
            <div style={s.statsRow}>
              <StatBadge value="Admin" label="Role Level" color="#c084fc" />
              <StatBadge value="Encrypted" label="Password" color={BRAND.cyan} />
              <StatBadge value="RBAC" label="Permission" color={BRAND.pink} />
            </div>
            <p style={s.tagline}>
              Sumi-Admin · Secure Healthcare Management Platform
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
        #admin-reg-name::placeholder, #admin-reg-email::placeholder, #admin-reg-mobile::placeholder, #admin-reg-pw::placeholder, #admin-reg-cf::placeholder {
          color: rgba(192, 132, 252, 0.4);
        }
        input:focus { outline: none; }
        #admin-reg-submit:not(:disabled):hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(168, 85, 247, 0.55);
        }
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
    maxWidth: 490,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "32px 24px 44px",
    boxSizing: "border-box",
    margin: "0 auto",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 40px",
    background: "linear-gradient(135deg, rgba(28,38,70,0.45) 0%, rgba(13,18,36,0.25) 100%)",
    borderLeft: "1px solid rgba(168,85,247,0.12)",
  },
  rightInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 28, maxWidth: 420 },
  card: {
    width: "100%",
    margin: "auto 0",
    background: "rgba(22, 27, 50, 0.78)",
    border: "1px solid rgba(168,85,247,0.25)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
    overflow: "hidden",
  },
  accentBar: {
    height: 4,
    background: `linear-gradient(90deg, #c084fc, ${BRAND.purple}, ${BRAND.cyan})`,
  },
  cardInner: { padding: "26px 28px 24px", display: "flex", flexDirection: "column", alignItems: "center" },
  logoWrap: { marginBottom: 14 },
  logoBox: {
    background: "#fff",
    borderRadius: 13,
    padding: "9px 18px",
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
    marginBottom: 14,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  titleGroup: { textAlign: "center", marginBottom: 18, width: "100%" },
  heading: { margin: 0, fontSize: 24, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px" },
  subheading: { margin: "5px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)" },
  errorBanner: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(239,68,68,0.11)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: "9px 13px",
    color: "#fca5a5",
    fontSize: 13,
    marginBottom: 14,
    boxSizing: "border-box",
  },
  fieldGroup: { width: "100%", marginBottom: 13, boxSizing: "border-box" },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 5, letterSpacing: "0.02em" },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(168,85,247,0.25)",
    borderRadius: 11,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputWrapError: { borderColor: "#f43f5e", boxShadow: "0 0 0 3px rgba(244,63,94,0.22)" },
  inputWrapSuccess: { borderColor: "rgba(34,197,94,0.65)", boxShadow: "0 0 0 3px rgba(34,197,94,0.12)" },
  inputIcon: { position: "absolute", left: 12, color: "#c084fc", display: "flex", alignItems: "center", pointerEvents: "none" },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: 14,
    padding: "12px 12px 12px 38px",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
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
  fieldError: { display: "inline-flex", alignItems: "center", gap: 5, color: "#fb7185", fontSize: 12, marginTop: 5, fontWeight: 600 },
  submitBtn: {
    width: "100%",
    padding: "13px",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #d946ef 100%)",
    border: "none",
    borderRadius: 11,
    cursor: "pointer",
    marginTop: 6,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(168,85,247,0.38)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  submitBtnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  spinnerWrap: { display: "inline-flex", alignItems: "center", gap: 8 },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footNote: { margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" },
  footLink: { color: "#c084fc", fontWeight: 700, cursor: "pointer" },
  successBox: { padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7e22ce, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 0 30px rgba(168,85,247,0.5)",
  },
  statsRow: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  tagline: { textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, margin: 0 },
};

function StatBadge({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${color}35`,
      borderRadius: 12,
      padding: "10px 18px",
      textAlign: "center",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ fontSize: 19, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}
