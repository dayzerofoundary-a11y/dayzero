import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";

const STEPS = [
  {
    stamp: "01",
    verb: "Draft",
    headline: "File your idea.",
    body: "Complete the intake form — one page, three minutes. Fill out a short form with your idea, its goal, and a brief description. That is all we need to begin.",
    detail: "NDA signed before we begin.",
    accent: "#A8822C",
  },
  {
    stamp: "02",
    verb: "Endorse",
    headline: "A single scope call.",
    body: "One conversation — thirty minutes. One short call to understand your idea and agree on what we will build. No presentations. No approval process. Simple briefing.",
    detail: "No commitment required.",
    accent: "#C9A24A",
  },
  {
    stamp: "03",
    verb: "Mint",
    headline: "MVP delivered.",
    body: "We build, test, and review your MVP before delivery. It arrives documented, ready to deploy, and ready for your next step.",
    detail: "Reviewed before handoff.",
    accent: "#A8822C",
  },
];

export function HowItWorks() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="how"
      style={{
        background: "#F4EFE4",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GuillocheBackground color="#131929" opacity={0.03} />

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
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#A8822C",
              marginBottom: "1.25rem",
            }}
          >
            <span style={{ opacity: 0.7, marginRight: "0.5rem" }}>✤</span>
            How It Works · Section V
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#131929",
              marginBottom: "1rem",
              textAlign: "center",
              margin: "0 auto 1.5rem",
              maxWidth: "800px",
            }}
          >
            From idea to MVP.
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "#6A6355",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            The journey from idea to MVP. Three steps. One outcome.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            position: "relative",
          }}
          className="how-grid"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.stamp}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              style={{
                background: "#FFF",
                border: "1px solid rgba(168, 130, 44, 0.25)",
                padding: "2.5rem 2rem",
                borderRadius: "4px",
                position: "relative",
                zIndex: 1,
                textAlign: "center",
                boxShadow: "0 8px 24px rgba(19, 25, 41, 0.05)",
                transition: "all 0.3s ease",
              }}
              className="how-step-card"
            >
              {/* Stamp Circle */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  margin: "0 auto 1.75rem",
                  position: "relative",
                }}
              >
                <svg
                  width="90"
                  height="90"
                  viewBox="0 0 90 90"
                  fill="none"
                  style={{ position: "absolute", inset: 0 }}
                >
                  <circle cx="45" cy="45" r="43" stroke={s.accent} strokeWidth="1.5" />
                  <circle
                    cx="45"
                    cy="45"
                    r="37"
                    stroke={s.accent}
                    strokeWidth="0.5"
                    strokeDasharray="3 2.5"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.52rem",
                      fontWeight: 400,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "#A8822C",
                      marginBottom: "2px",
                    }}
                  >
                    PHASE
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      lineHeight: 1,
                      color: "#131929",
                    }}
                  >
                    {s.stamp}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: s.accent,
                  marginBottom: "0.4rem",
                }}
              >
                {s.verb}
              </div>

              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.6rem",
                  fontWeight: 500,
                  color: "#131929",
                  marginBottom: "1rem",
                }}
              >
                {s.headline}
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  lineHeight: 1.65,
                  color: "#6A6355",
                  marginBottom: "1.5rem",
                }}
              >
                {s.body}
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.75rem",
                  background: "rgba(168, 130, 44, 0.08)",
                  border: "1px solid rgba(168, 130, 44, 0.2)",
                  borderRadius: "2px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  color: "#A8822C",
                  letterSpacing: "0.05em",
                }}
              >
                ✓ {s.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .how-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
