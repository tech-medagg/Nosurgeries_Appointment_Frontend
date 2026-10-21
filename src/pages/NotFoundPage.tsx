import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Floating particle types
───────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  opacity: number;
}

const COLORS = ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#14b8a6", "#2dd4bf"];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: Math.random() * 0.015 + 0.005,
    angle: Math.random() * Math.PI * 2,
    opacity: Math.random() * 0.5 + 0.2,
  }));
}

function useParticles(count: number) {
  const [particles, setParticles] = useState<Particle[]>(() => makeParticles(count));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      if (frame % 2 === 0) {
        setParticles((prev) =>
          prev.map((p) => {
            const newAngle = p.angle + (Math.random() - 0.5) * 0.1;
            let nx = p.x + Math.cos(newAngle) * p.speed;
            let ny = p.y + Math.sin(newAngle) * p.speed;
            if (nx < 0) nx = 100;
            if (nx > 100) nx = 0;
            if (ny < 0) ny = 100;
            if (ny > 100) ny = 0;
            return { ...p, x: nx, y: ny, angle: newAngle };
          })
        );
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count]);

  return particles;
}

/* ─────────────────────────────────────────────
   Medical Cross SVG
───────────────────────────────────────────── */
function MedicalCross({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="2" width="8" height="24" rx="3" fill="currentColor" />
      <rect x="2" y="10" width="24" height="8" rx="3" fill="currentColor" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Pulse Ring badge dot
───────────────────────────────────────────── */
function PulseRing() {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
      <span style={styles.pulseRingOuter} />
      <span style={styles.pulseRingInner} />
    </span>
  );
}

/* ─────────────────────────────────────────────
   Main 404 Page
───────────────────────────────────────────── */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [ghostHovered, setGhostHovered] = useState(false);
  const [count, setCount] = useState(8);
  const particles = useParticles(28);

  /* countdown redirect */
  useEffect(() => {
    if (count <= 0) {
      navigate(-1);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div style={styles.root}>
      {/* animated gradient BG */}
      <div style={styles.gradientBg} />

      {/* floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            ...styles.particle,
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* grid overlay */}
      <div style={styles.gridOverlay} />

      {/* main card */}
      <div style={styles.card}>
        {/* header badge */}
        <div style={styles.badge}>
          <PulseRing />
          <span style={styles.badgeText}>NoSurgeries · Error 404</span>
        </div>

        {/* giant 404 */}
        <div style={styles.fourOhFourWrap}>
          {/* Left 4 */}
          <div style={styles.bigDigit}>
            <MedicalCross style={styles.crossInsideDigitLeft} />
            <span style={styles.digitText}>4</span>
          </div>

          {/* 0 with heartbeat inside */}
          <div style={{ ...styles.bigDigit, flexDirection: "column", gap: 4 }}>
            <svg viewBox="0 0 80 40" style={styles.heartbeat} xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="0,20 12,20 18,5 26,35 34,5 42,35 50,20 62,20 68,10 74,30 80,20"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <animate
                  attributeName="stroke-dasharray"
                  values="0,300;300,0"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </polyline>
            </svg>
            <span style={styles.digitText}>0</span>
          </div>

          {/* Right 4 */}
          <div style={styles.bigDigit}>
            <span style={styles.digitText}>4</span>
            <MedicalCross style={styles.crossInsideDigitRight} />
          </div>
        </div>

        {/* floating stethoscope */}
        <div style={styles.stethoscopeWrap}>
          <svg
            width="110"
            height="110"
            viewBox="0 0 110 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={styles.stethoscopeSvg}
          >
            <path
              d="M20 20 C20 50, 40 60, 55 75 C70 90, 95 90, 95 75 C95 60, 80 60, 80 75"
              stroke="#0ea5e9"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="20" cy="18" r="7" fill="#0ea5e9" opacity="0.8" />
            <circle cx="40" cy="18" r="7" fill="#0ea5e9" opacity="0.8" />
            <circle cx="80" cy="80" r="13" fill="#0ea5e9" opacity="0.9" />
            <circle cx="80" cy="80" r="7" fill="#fff" opacity="0.5" />
            {/* animated ring around chest piece */}
            <circle cx="80" cy="80" r="13" stroke="#38bdf8" strokeWidth="2" fill="none">
              <animate attributeName="r" values="13;24;13" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <h1 style={styles.heading}>Page Not Found</h1>
        <p style={styles.subheading}>
          Looks like this appointment got lost in triage.
          <br />
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* actions */}
        <div style={styles.actions}>
          <button
            id="not-found-go-back-btn"
            style={{
              ...styles.btnPrimary,
              ...(hovered ? styles.btnPrimaryHover : {}),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
          <button
            id="not-found-home-btn"
            style={{
              ...styles.btnGhost,
              ...(ghostHovered ? styles.btnGhostHover : {}),
            }}
            onMouseEnter={() => setGhostHovered(true)}
            onMouseLeave={() => setGhostHovered(false)}
            onClick={() => navigate("/login")}
          >
            Home
          </button>
        </div>

        {/* countdown */}
        <p style={styles.countdown}>
          Auto-redirecting in{" "}
          <span style={styles.countdownNum}>{count}s</span>
        </p>
      </div>

      {/* decorative floating crosses */}
      {([
        { top: "8%",     left: "6%",   size: 22, delay: "0s",   color: "#0ea5e9" },
        { top: "15%",    right: "8%",  size: 16, delay: "0.4s", color: "#14b8a6" },
        { bottom: "18%", left: "10%", size: 18, delay: "0.8s", color: "#38bdf8" },
        { bottom: "10%", right: "6%", size: 24, delay: "0.2s", color: "#0ea5e9" },
        { top: "50%",    left: "3%",   size: 12, delay: "1s",   color: "#7dd3fc" },
        { top: "40%",    right: "3%",  size: 14, delay: "0.6s", color: "#2dd4bf" },
      ] as Array<{ top?: string; bottom?: string; left?: string; right?: string; size: number; delay: string; color: string }>).map((c, i) => (
        <span
          key={i}
          style={{
            position: "fixed",
            top:    c.top,
            left:   c.left,
            right:  c.right,
            bottom: c.bottom,
            color: c.color,
            opacity: 0.25,
            animation: `floatCross 4s ease-in-out ${c.delay} infinite alternate`,
          }}
        >
          <MedicalCross style={{ width: c.size, height: c.size }} />
        </span>
      ))}

      {/* keyframes */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatCard {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatCross {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-18px) rotate(15deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes stethFloat {
          0%   { transform: translateY(0) rotate(-6deg); }
          50%  { transform: translateY(-8px) rotate(6deg); }
          100% { transform: translateY(0) rotate(-6deg); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 12px #0ea5e960); }
          50%       { filter: drop-shadow(0 0 28px #0ea5e9bb); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
    background: "#020d1a",
  },
  gradientBg: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, #020d1a 0%, #031628 30%, #052038 60%, #041520 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 12s ease infinite",
    zIndex: 0,
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    zIndex: 1,
  },
  particle: {
    position: "absolute",
    borderRadius: "50%",
    zIndex: 1,
    pointerEvents: "none",
    transition: "left 0.4s linear, top 0.4s linear",
  },
  card: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(14,165,233,0.2)",
    borderRadius: "28px",
    padding: "52px 56px",
    maxWidth: "560px",
    width: "90%",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 0 60px rgba(14,165,233,0.08), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
    animation: "floatCard 6s ease-in-out infinite",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(14,165,233,0.1)",
    border: "1px solid rgba(14,165,233,0.3)",
    borderRadius: "999px",
    padding: "6px 16px",
  },
  badgeText: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#7dd3fc",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  pulseRingOuter: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(14,165,233,0.4)",
    position: "absolute",
    animation: "pulseRing 1.5s ease-out infinite",
  },
  pulseRingInner: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#0ea5e9",
    position: "relative",
  },
  fourOhFourWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    userSelect: "none",
    animation: "glowPulse 3s ease-in-out infinite",
  },
  bigDigit: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: "clamp(80px, 14vw, 120px)",
    fontWeight: 800,
    lineHeight: 1,
    color: "transparent",
    background: "linear-gradient(135deg, #e0f2fe 0%, #0ea5e9 50%, #0284c7 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    letterSpacing: "-4px",
  },
  heartbeat: {
    width: "80px",
    height: "30px",
    marginBottom: "-8px",
  },
  crossInsideDigitLeft: {
    position: "absolute",
    top: "4px",
    left: "-22px",
    width: "18px",
    height: "18px",
    color: "#38bdf8",
    opacity: 0.7,
  },
  crossInsideDigitRight: {
    position: "absolute",
    top: "4px",
    right: "-22px",
    width: "18px",
    height: "18px",
    color: "#38bdf8",
    opacity: 0.7,
  },
  stethoscopeWrap: {
    marginTop: "-8px",
    marginBottom: "-8px",
  },
  stethoscopeSvg: {
    animation: "stethFloat 4s ease-in-out infinite",
    filter: "drop-shadow(0 0 12px #0ea5e980)",
  },
  heading: {
    margin: 0,
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: 700,
    color: "#f0f9ff",
    textAlign: "center",
    letterSpacing: "-0.5px",
  },
  subheading: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#7dd3fc",
    textAlign: "center",
    opacity: 0.85,
  },
  actions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "4px",
  },
  btnPrimary: {
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(14,165,233,0.35)",
    transition: "all 0.2s ease",
    letterSpacing: "0.01em",
  },
  btnPrimaryHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 28px rgba(14,165,233,0.55)",
    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
  },
  btnGhost: {
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#7dd3fc",
    background: "rgba(14,165,233,0.1)",
    border: "1px solid rgba(14,165,233,0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "0.01em",
  },
  btnGhostHover: {
    background: "rgba(14,165,233,0.2)",
    transform: "translateY(-2px)",
  },
  countdown: {
    margin: 0,
    fontSize: "13px",
    color: "rgba(125,211,252,0.5)",
    textAlign: "center",
  },
  countdownNum: {
    color: "#38bdf8",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
};
