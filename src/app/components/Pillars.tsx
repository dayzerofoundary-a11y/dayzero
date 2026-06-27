import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";
import { Clock, Hammer, Shield, Award, Banknote } from "lucide-react";

const PILLARS = [
  {
    icon: Clock,
    title: "Time",
    tagline: "You spend none.",
    body: "From intake to delivery, we handle the entire build. Your involvement is limited to two conversations — the brief and the handoff.",
    accent: "#A8822C",
  },
  {
    icon: Hammer,
    title: "Effort",
    tagline: "We build it.",
    body: "Engineering, design, deployment — handled entirely by a dedicated team. You remain uninvolved in execution.",
    accent: "#A8822C",
  },
  {
    icon: Shield,
    title: "Security",
    tagline: "Agreement signed first.",
    body: "A legally binding confidentiality agreement is filed before any detail is shared. Your idea is protected from the moment you contact us.",
    accent: "#C9A24A",
  },
  {
    icon: Award,
    title: "Success",
    tagline: "Verified before it ships.",
    body: "Industry veterans review the build against a certification checklist. Nothing is handed to you that hasn't been independently verified.",
    accent: "#A8822C",
  },
  {
    icon: Banknote,
    title: "Cost",
    tagline: "FREE, to start.",
    body: "The initial MVP is built completely FREE. While the core MVP has no upfront cost, we sell additional development time and dedicated engineering sprints for ongoing scaling, accelerated delivery, or custom additions.",
    accent: "#C9A24A",
  },
];

export function Pillars() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="pillars"
      style={{
        background: "#131929",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GuillocheBackground color="#F4EFE4" opacity={0.03} />

      {/* Ledger grid lines */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(244,239,228,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,239,228,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#A8822C",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ opacity: 0.7, marginRight: "0.5rem" }}>✤</span>
            Five Denominations · Section IV
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#F4EFE4",
              marginBottom: "2rem",
              textAlign: "center",
              margin: "0 auto 2rem",
              maxWidth: "800px",
            }}
          >
            What every engagement is worth.
          </h2>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1px",
            background: "rgba(168, 130, 44, 0.35)",
            border: "1px solid rgba(168, 130, 44, 0.35)",
          }}
          className="pillars-grid"
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
              whileHover={prefersReduced ? {} : { scale: 1.025, backgroundColor: "rgba(26, 34, 56, 0.85)", y: -4, zIndex: 10 }}
              style={{
                backgroundColor: "rgba(19, 25, 41, 0.75)",
                padding: "2rem 1.5rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              {/* Large background icon */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  right: "-30px",
                  color: "rgba(168, 130, 44, 0.07)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                <p.icon size={140} strokeWidth={1} />
              </div>

              <div
                style={{
                  color: p.accent,
                  marginBottom: "0.75rem",
                }}
              >
                <p.icon size={20} strokeWidth={1.5} />
              </div>

              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "#F4EFE4",
                  marginBottom: "0.4rem",
                  lineHeight: 1.2,
                }}
              >
                {p.title}
              </div>

              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: p.accent,
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                }}
              >
                {p.tagline}
              </div>

              <div
                style={{
                  width: "24px",
                  height: "1px",
                  background: "rgba(168,130,44,0.4)",
                  marginBottom: "1rem",
                }}
              />

              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(244,239,228,0.55)",
                  flex: 1,
                }}
              >
                {p.body}
              </div>

              {/* Corner ornament */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  opacity: 0.2,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="#A8822C" strokeWidth="0.75" />
                  <circle cx="9" cy="9" r="5" stroke="#A8822C" strokeWidth="0.5" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pillars-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
