import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import brandLogo from "../../assets/logo.png";
import { BRAND } from "../../theme/theme";
import { registerApi } from "../../services/auth.api";

/* ── Validation schemas ────────────────────────────── */
const registerSchema = z
  .object({
    roleName: z.enum(["PATIENT", "DOCTOR"]),
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
      .min(1, "Email address is required")
      .email("Enter a valid email address (e.g. you@example.com)"),
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

type RegisterFormData = z.infer<typeof registerSchema>;

/* ── Inline SVG Icons ──────────────────────────────── */
const UserIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>;
const LockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const EyeIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const AlertIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const CheckIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;



/* ── Right-panel illustration ──────────────────────── */
const IllustrationPanel = () => (
  <svg viewBox="0 0 400 520" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", maxWidth: 360, filter: "drop-shadow(0 20px 60px rgba(232,45,124,0.2))" }}>
    {/* Background glow */}
    <ellipse cx="200" cy="300" rx="170" ry="130" fill="rgba(232,45,124,0.06)" />
    <ellipse cx="200" cy="290" rx="100" ry="80" fill="rgba(91,45,142,0.09)" />

    {/* Calendar card */}
    <rect x="50" y="60" width="300" height="220" rx="18" fill="#1c2646" stroke="rgba(41,196,224,0.25)" strokeWidth="1.5" />
    <rect x="50" y="60" width="300" height="44" rx="18" fill="#28355c" />
    <rect x="50" y="86" width="300" height="18" fill="#28355c" />
    {/* Calendar header */}
    <text x="200" y="88" textAnchor="middle" fill={BRAND.cyan} fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">September 2026</text>
    {/* Day headers */}
    {["S","M","T","W","T","F","S"].map((d,i)=>(
      <text key={i} x={74+i*36} y="120" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter,sans-serif">{d}</text>
    ))}
    {/* Day grid */}
    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((n,i)=>{
      const row = Math.floor(i/7);
      const col = i%7;
      const active = n===14 || n===21;
      const booked = n===8 || n===16;
      return (
        <g key={n}>
          {active && <circle cx={74+col*36} cy={145+row*36} r="14" fill={BRAND.purple} opacity="0.85"/>}
          {booked && <circle cx={74+col*36} cy={145+row*36} r="14" fill={BRAND.pink} opacity="0.7"/>}
          <text x={74+col*36} y={150+row*36} textAnchor="middle" fill={active||booked?"white":"rgba(255,255,255,0.65)"} fontSize="12" fontFamily="Inter,sans-serif" fontWeight={active?"700":"400"}>{n}</text>
        </g>
      );
    })}

    {/* Appointment card 1 */}
    <rect x="50" y="300" width="140" height="80" rx="14" fill="#1e2d54" stroke={`${BRAND.cyan}40`} strokeWidth="1.5"/>
    <circle cx="78" cy="326" r="14" fill={BRAND.purple} opacity="0.85"/>
    <text x="78" y="331" textAnchor="middle" fill="white" fontSize="10" fontFamily="Inter,sans-serif">Dr.</text>
    <text x="120" y="322" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Dr. Mehta</text>
    <text x="120" y="337" fill={BRAND.cyan} fontSize="10" fontFamily="Inter,sans-serif">Orthopedics</text>
    <rect x="68" y="350" width="60" height="18" rx="6" fill={`${BRAND.cyan}25`} stroke={`${BRAND.cyan}50`} strokeWidth="1"/>
    <text x="98" y="363" textAnchor="middle" fill={BRAND.cyan} fontSize="9" fontFamily="Inter,sans-serif">10:30 AM</text>
    {/* animated dot */}
    <circle cx="170" cy="320" r="5" fill="#22c55e">
      <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/>
    </circle>

    {/* Appointment card 2 */}
    <rect x="210" y="300" width="140" height="80" rx="14" fill="#1e2d54" stroke={`${BRAND.pink}40`} strokeWidth="1.5"/>
    <circle cx="238" cy="326" r="14" fill={BRAND.pink} opacity="0.85"/>
    <text x="238" y="331" textAnchor="middle" fill="white" fontSize="10" fontFamily="Inter,sans-serif">Dr.</text>
    <text x="280" y="322" fill="white" fontSize="11" fontWeight="600" fontFamily="Inter,sans-serif">Dr. Sharma</text>
    <text x="280" y="337" fill={BRAND.pink} fontSize="10" fontFamily="Inter,sans-serif">Cardiology</text>
    <rect x="228" y="350" width="60" height="18" rx="6" fill={`${BRAND.pink}25`} stroke={`${BRAND.pink}50`} strokeWidth="1"/>
    <text x="258" y="363" textAnchor="middle" fill={BRAND.pink} fontSize="9" fontFamily="Inter,sans-serif">2:00 PM</text>

    {/* Heartbeat strip */}
    <rect x="50" y="400" width="300" height="60" rx="14" fill="#1e2d54" stroke="rgba(41,196,224,0.15)" strokeWidth="1"/>
    <text x="75" y="422" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter,sans-serif">Live Health</text>
    <polyline points="80,445 100,445 110,428 122,460 134,432 146,445 170,445 180,438 192,455 204,445 230,445"
      fill="none" stroke={BRAND.cyan} strokeWidth="2" strokeLinecap="round">
      <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2s" repeatCount="indefinite"/>
    </polyline>
    <circle cx="310" cy="430" r="12" fill={`${BRAND.pink}20`} stroke={BRAND.pink} strokeWidth="1.5"/>
    <text x="310" y="435" textAnchor="middle" fill={BRAND.pink} fontSize="8" fontFamily="Inter,sans-serif">♥ 72</text>

    {/* Medical cross decoration */}
    <rect x="340" y="60" width="28" height="9" rx="3" fill={BRAND.pink} opacity="0.5"/>
    <rect x="349" y="51" width="9" height="28" rx="3" fill={BRAND.pink} opacity="0.5"/>
    {/* Pill decoration */}
    <rect x="55" y="490" width="38" height="18" rx="9" fill={BRAND.purple} opacity="0.55"/>
    <line x1="74" y1="490" x2="74" y2="508" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>

    {/* Title text */}
    <text x="200" y="38" textAnchor="middle" fill="white" fontSize="17" fontWeight="800" fontFamily="Inter,sans-serif" opacity="0.9">Smart Appointment Booking</text>
    <text x="200" y="54" textAnchor="middle" fill={BRAND.cyan} fontSize="10" fontFamily="Inter,sans-serif" opacity="0.65">No Surgeries · Hassle-Free Healthcare</text>
  </svg>
);

/* ── Shared form field ─────────────────────────────── */
function Field({
  id, label, icon, type = "text", placeholder, register: reg, error, touched,
  rightSlot, required = true,
}: {
  id: string; label: string; icon: React.ReactNode; type?: string;
  placeholder: string; register: ReturnType<import('react-hook-form').UseFormRegister<Record<string, string>>>; error?: string; touched?: boolean;
  rightSlot?: React.ReactNode; required?: boolean;
}) {
  return (
    <div style={{ width: "100%", marginBottom: 14 }}>
      <label style={s.label} htmlFor={id}>
        {label} {required && <span style={{ color: "#f43f5e", fontWeight: 700, marginLeft: 2 }} title="Required">*</span>}
      </label>
      <div style={{
        ...s.inputWrap,
        ...(error ? s.inputErr : touched ? s.inputOk : {}),
      }}>
        <span style={{ ...s.inputIcon, color: error ? "#f43f5e" : touched ? "#22c55e" : BRAND.cyan }}>{icon}</span>
        <input id={id} type={type} placeholder={placeholder} autoComplete="off"
          style={{ ...s.input, ...(rightSlot ? { paddingRight: 44 } : {}) }}
          aria-required={required}
          {...reg} />
        {rightSlot && <span style={s.inputRight}>{rightSlot}</span>}
      </div>
      {error && (
        <span style={s.fieldErr}><AlertIcon /> {error}</span>
      )}
    </div>
  );
}

/* ── Password strength bar ─────────────────────────── */
function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const colors = ["#ef4444","#f97316","#eab308","#22c55e"];
  const labels = ["Weak","Fair","Good","Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: -8, marginBottom: 10 }}>
      <div style={{ display:"flex", gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{ flex:1, height:3, borderRadius:4, background: i<=score ? colors[score-1] : "rgba(255,255,255,0.1)", transition:"background 0.3s" }}/>
        ))}
      </div>
      <span style={{ fontSize:11, color: score>0 ? colors[score-1] : "transparent", fontWeight:600 }}>
        {score > 0 && labels[score-1]}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roleName: "PATIENT",
      fullName: "",
      email: "",
      mobile: "",
      password: "",
      confirm: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = form;

  const currentRole = watch("roleName");
  const pw = watch("password");

  const onSubmit = async (values: RegisterFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      const cleanMobile = values.mobile.replace(/[\s-]/g, "");
      const res = await registerApi({
        roleName: values.roleName,
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        mobile: cleanMobile,
        password: values.password,
      });

      if (res.success) {
        // Sync newly registered profile to stored accounts list with its accurate role
        try {
          const raw = localStorage.getItem("ns_google_accounts_v3");
          const existing: Array<{ email: string; name: string; roleName: string }> = raw ? JSON.parse(raw) : [];
          const cleanEmail = values.email.trim().toLowerCase();
          const role = values.roleName === "DOCTOR" ? "DOCTOR" : "PATIENT";
          const filtered = existing.filter((a) => a.email.toLowerCase() !== cleanEmail);
          const newAccount = {
            name: values.fullName.trim() || cleanEmail.split("@")[0],
            email: cleanEmail,
            roleName: role,
            avatarColor: role === "DOCTOR" ? "#1a73e8" : "#2e7d32",
            avatarLetter: (values.fullName.trim().charAt(0) || "U").toUpperCase(),
            avatarType: "letter",
            isSignedOut: false,
          };
          localStorage.setItem("ns_google_accounts_v3", JSON.stringify([newAccount, ...filtered].slice(0, 8)));
        } catch (_) {}

        setSuccess(true);
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setServerError(res.message || "Registration failed. Please try again.");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setServerError(
        err?.response?.data?.message || err?.message || "Registration failed. Please try again."
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

      <div style={s.layout} className="ns-reg-layout">
        {/* ══ LEFT: FORM ══ */}
        <div style={s.leftPanel} className="ns-reg-left">
          <div style={s.card}>
            <div style={s.accentBar} />

            {success ? (
              <div style={s.successBox}>
                <div style={s.successIcon}><CheckIcon /></div>
                <h2 style={{ ...s.heading, marginBottom: 8 }}>Account Created!</h2>
                <p style={{ ...s.sub, marginBottom: 0 }}>Redirecting you to sign in…</p>
              </div>
            ) : (
              <div style={s.cardInner}>
                {/* Logo */}
                <div style={s.logoWrap}>
                  <div style={s.logoBox}>
                    <img src={brandLogo} alt="NoSurgeries" style={{ height: 40, width: "auto", objectFit: "contain" }} />
                  </div>
                </div>

                <div style={s.titleGroup}>
                  <h1 style={s.heading}>Create Account</h1>
                  <p style={s.sub}>Join NoSurgeries and book appointments easily</p>
                </div>

                {/* Role Switcher */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setValue("roleName", "PATIENT", { shouldValidate: true })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${currentRole === "PATIENT" ? BRAND.cyan : "rgba(255,255,255,0.12)"}`,
                      background: currentRole === "PATIENT" ? "rgba(41, 196, 224, 0.16)" : "rgba(255,255,255,0.04)",
                      color: currentRole === "PATIENT" ? BRAND.cyan : "rgba(255,255,255,0.7)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    👤 Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("roleName", "DOCTOR", { shouldValidate: true })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${currentRole === "DOCTOR" ? BRAND.pink : "rgba(255,255,255,0.12)"}`,
                      background: currentRole === "DOCTOR" ? "rgba(232, 45, 124, 0.16)" : "rgba(255,255,255,0.04)",
                      color: currentRole === "DOCTOR" ? BRAND.pink : "rgba(255,255,255,0.7)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    🩺 Doctor
                  </button>
                </div>

                {serverError && (
                  <div style={s.errBanner}><AlertIcon /><span>{serverError}</span></div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: "100%" }}>
                  <Field
                    id="reg-name"
                    label="Full Name"
                    icon={<UserIcon />}
                    placeholder="e.g. John Doe"
                    register={register("fullName")}
                    error={errors.fullName?.message}
                    touched={!!touchedFields.fullName}
                  />

                  <Field
                    id="reg-email"
                    label="Email Address"
                    icon={<MailIcon />}
                    placeholder="you@example.com"
                    type="email"
                    register={register("email")}
                    error={errors.email?.message}
                    touched={!!touchedFields.email}
                  />

                  <Field
                    id="reg-phone"
                    label="Mobile Number"
                    icon={<PhoneIcon />}
                    placeholder="+91 98765 43210"
                    type="tel"
                    register={register("mobile")}
                    error={errors.mobile?.message}
                    touched={!!touchedFields.mobile}
                  />

                  <Field
                    id="reg-pw"
                    label="Password"
                    icon={<LockIcon />}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    type={showPw ? "text" : "password"}
                    register={register("password")}
                    error={errors.password?.message}
                    touched={!!touchedFields.password}
                    rightSlot={
                      <button
                        type="button"
                        id="reg-pw-toggle"
                        aria-label="Toggle password"
                        style={s.eyeBtn}
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />

                  <StrengthBar password={pw} />

                  {/* Dynamic Password Requirements Checklist */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, marginTop: -4 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: pw.length >= 8 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
                      color: pw.length >= 8 ? "#4ade80" : "rgba(255,255,255,0.45)",
                      border: `1px solid ${pw.length >= 8 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s ease",
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s ease",
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s ease",
                    }}>
                      {/[0-9]/.test(pw) ? "✓" : "○"} 1 number
                    </span>
                  </div>

                  <Field
                    id="reg-cf"
                    label="Confirm Password"
                    icon={<ShieldIcon />}
                    placeholder="Repeat password"
                    type={showCf ? "text" : "password"}
                    register={register("confirm")}
                    error={errors.confirm?.message}
                    touched={!!touchedFields.confirm}
                    rightSlot={
                      <button
                        type="button"
                        id="reg-cf-toggle"
                        aria-label="Toggle confirm"
                        style={s.eyeBtn}
                        onClick={() => setShowCf((v) => !v)}
                      >
                        {showCf ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />

                  <button
                    id="reg-submit"
                    type="submit"
                    disabled={isSubmitting}
                    style={{ ...s.submitBtn, ...(isSubmitting ? s.submitDis : {}) }}
                  >
                    {isSubmitting ? (
                      <>
                        <span style={s.spinner} /> Creating Account…
                      </>
                    ) : (
                      `Create ${currentRole === "DOCTOR" ? "Doctor" : "Patient"} Account`
                    )}
                  </button>
                </form>

                <p style={s.footNote}>
                  Already have an account?{" "}
                  <span style={s.footLink} onClick={() => navigate("/login")}>Sign In</span>
                </p>

                <p style={s.termsNote}>
                  By creating an account you agree to our{" "}
                  <span style={s.termsLink}>Terms of Service</span> &amp;{" "}
                  <span style={s.termsLink}>Privacy Policy</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: ILLUSTRATION ══ */}
        <div style={s.rightPanel} className="ns-reg-right">
          <div style={s.rightInner}>
            <IllustrationPanel/>
            <div style={s.statsRow}>
              <StatBadge value="50k+" label="Happy Patients" color={BRAND.cyan}/>
              <StatBadge value="200+" label="Hospitals"      color={BRAND.pink}/>
              <StatBadge value="Zero" label="Wait-lists"     color={BRAND.purpleLight}/>
            </div>
            <p style={s.tagline}>Your health, your schedule.<br/>Book smart with NoSurgeries.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bgShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        input::placeholder{color:rgba(103,232,249,0.38)!important}
        input:focus{outline:none}
        #reg-submit-e:not(:disabled):hover,
        #reg-submit-p:not(:disabled):hover{filter:brightness(1.13);transform:translateY(-1px);box-shadow:0 8px 28px rgba(91,45,142,0.55)}
        .reg-social-btn:hover{background:rgba(255,255,255,0.1)!important}
        @media (max-width: 900px) {
          .ns-reg-layout { flex-direction: column !important; min-height: 100vh !important; }
          .ns-reg-right { display: none !important; }
          .ns-reg-left { max-width: 100% !important; padding: 24px 16px 40px !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Stat badge ──────────────────────────────────── */
function StatBadge({value,label,color}:{value:string;label:string;color:string}) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${color}30`,borderRadius:12,
      padding:"10px 18px",textAlign:"center",backdropFilter:"blur(8px)"}}>
      <div style={{fontSize:19,fontWeight:800,color,lineHeight:1}}>{value}</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:3,fontWeight:500}}>{label}</div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  root:{minHeight:"100vh",width:"100%",display:"flex",alignItems:"stretch",fontFamily:"'Inter',system-ui,sans-serif",position:"relative",overflowX:"hidden",background:"#0d1224"},
  bg:{position:"fixed",inset:0,background:"linear-gradient(135deg,#0a0f1e 0%,#0d1224 30%,#12172e 60%,#0d1224 100%)",backgroundSize:"400% 400%",animation:"bgShift 14s ease infinite",zIndex:0},
  grid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(41,196,224,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(41,196,224,0.04) 1px,transparent 1px)",backgroundSize:"48px 48px",zIndex:0},
  orb:{position:"fixed",borderRadius:"50%",pointerEvents:"none",zIndex:0},
  orb1:{width:500,height:500,top:-140,left:-120,background:"radial-gradient(circle,rgba(91,45,142,0.2) 0%,transparent 70%)"},
  orb2:{width:400,height:400,bottom:-100,right:-80,background:"radial-gradient(circle,rgba(41,196,224,0.15) 0%,transparent 70%)"},
  orb3:{width:300,height:300,top:"40%",left:"45%",background:"radial-gradient(circle,rgba(232,45,124,0.09) 0%,transparent 70%)"},
  layout:{position:"relative",zIndex:1,display:"flex",width:"100%",minHeight:"100vh"},
  leftPanel:{flex:"0 0 auto",width:"100%",maxWidth:490,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"32px 24px 44px",boxSizing:"border-box",margin:"0 auto"},
  rightPanel:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 40px",background:"linear-gradient(135deg,rgba(28,38,70,0.45) 0%,rgba(13,18,36,0.25) 100%)",borderLeft:"1px solid rgba(41,196,224,0.08)"},
  rightInner:{display:"flex",flexDirection:"column",alignItems:"center",gap:28,maxWidth:420},
  card:{width:"100%",margin:"auto 0",background:"rgba(28,38,70,0.72)",border:"1px solid rgba(41,196,224,0.17)",borderRadius:20,backdropFilter:"blur(24px)",boxShadow:"0 24px 64px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.03) inset",overflow:"hidden",boxSizing:"border-box"},
  accentBar:{height:4,background:`linear-gradient(90deg,${BRAND.purple},${BRAND.pink},${BRAND.cyan})`},
  cardInner:{padding:"26px 28px 24px",display:"flex",flexDirection:"column",alignItems:"center"},
  logoWrap:{marginBottom:16},
  logoBox:{background:"#fff",borderRadius:13,padding:"9px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",display:"inline-flex",alignItems:"center"},
  titleGroup:{textAlign:"center",marginBottom:18,width:"100%"},
  heading:{margin:0,fontSize:24,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.5px"},
  sub:{margin:"5px 0 0",fontSize:13,color:BRAND.cyanLight,opacity:0.7},
  tabRow:{display:"flex",width:"100%",marginBottom:18,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4,gap:4},
  tab:{flex:1,padding:"9px 0",fontSize:13,fontWeight:600,border:"none",borderRadius:9,cursor:"pointer",background:"transparent",color:"rgba(255,255,255,0.45)",transition:"all 0.2s",fontFamily:"'Inter',system-ui,sans-serif"},
  tabActive:{background:`linear-gradient(135deg,${BRAND.purple},${BRAND.pink})`,color:"#fff",boxShadow:"0 4px 14px rgba(91,45,142,0.4)"},
  errBanner:{width:"100%",display:"flex",alignItems:"center",gap:7,background:"rgba(239,68,68,0.11)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"9px 13px",color:"#fca5a5",fontSize:13,marginBottom:14,boxSizing:"border-box"},
  label:{display:"block",fontSize:12,fontWeight:600,color:BRAND.cyanLight,marginBottom:5,letterSpacing:"0.02em"},
  inputWrap:{position:"relative",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(41,196,224,0.22)",borderRadius:11,transition:"border-color 0.2s,box-shadow 0.2s"},
  inputErr:{borderColor:"#f43f5e",boxShadow:"0 0 0 3px rgba(244,63,94,0.22)",background:"rgba(244,63,94,0.05)"},
  inputOk:{borderColor:"rgba(34,197,94,0.65)",boxShadow:"0 0 0 3px rgba(34,197,94,0.12)"},
  inputIcon:{position:"absolute",left:12,color:BRAND.cyan,display:"flex",alignItems:"center",pointerEvents:"none",opacity:0.85},
  input:{width:"100%",background:"transparent",border:"none",outline:"none",color:"#f1f5f9",fontSize:14,padding:"12px 12px 12px 38px",fontFamily:"'Inter',system-ui,sans-serif",boxSizing:"border-box"},
  inputRight:{position:"absolute",right:10},
  eyeBtn:{background:"none",border:"none",cursor:"pointer",color:"rgba(103,232,249,0.5)",display:"flex",alignItems:"center",padding:4,borderRadius:6,transition:"color 0.2s"},
  fieldErr:{display:"inline-flex",alignItems:"center",gap:5,color:"#fb7185",fontSize:12,marginTop:5,fontWeight:600},
  submitBtn:{width:"100%",padding:"13px",fontSize:15,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.pink} 100%)`,border:"none",borderRadius:11,cursor:"pointer",marginTop:6,transition:"all 0.2s ease",boxShadow:"0 4px 20px rgba(91,45,142,0.38)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Inter',system-ui,sans-serif"},
  submitDis:{opacity:0.55,cursor:"not-allowed"},
  spinner:{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"},
  dividerRow:{display:"flex",alignItems:"center",gap:10,width:"100%",margin:"16px 0 12px"},
  dividerLine:{flex:1,height:1,background:"rgba(255,255,255,0.08)"},
  dividerTxt:{fontSize:12,color:"rgba(255,255,255,0.35)",whiteSpace:"nowrap"},
  socialRow:{display:"flex",gap:12,marginBottom:16},
  socialBtn:{width:48,height:48,borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},
  footNote:{margin:"0 0 8px",fontSize:13,color:"rgba(255,255,255,0.4)",textAlign:"center"},
  footLink:{color:BRAND.cyan,fontWeight:700,cursor:"pointer"},
  termsNote:{margin:0,fontSize:11,color:"rgba(255,255,255,0.28)",textAlign:"center",lineHeight:1.6},
  termsLink:{color:`${BRAND.cyan}`,opacity:0.7,cursor:"pointer"},
  successBox:{padding:"48px 32px",display:"flex",flexDirection:"column",alignItems:"center",gap:14},
  successIcon:{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${BRAND.purple},${BRAND.pink})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",animation:"popIn 0.4s ease",boxShadow:`0 0 30px ${BRAND.pink}50`},
  statsRow:{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"},
  tagline:{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:15,lineHeight:1.7,margin:0},
};
