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
    body: "One conversation — thirty minutes. One short call to understand your idea and agree on what we'll build. No presentations. No approval process. Simple briefing.",
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
            How It Works · Section V
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#131929",
              marginBottom: "2rem",
              textAlign: "center",
              margin: "0 auto 2rem",
              maxWidth: "800px",
            }}
          >
            From idea to MVP.
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
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
            gap: "0",
            position: "relative",
          }}
          className="how-grid"
        >
          {/* Connector lines */}
          <motion.div
            aria-hidden
            initial={prefersReduced ? {} : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.25 }}
            style={{
              position: "absolute",
              top: "52px",
              left: "calc(100% / 6)",
              right: "calc(100% / 6)",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(168,130,44,0.4), rgba(168,130,44,0.4), transparent)",
              pointerEvents: "none",
              zIndex: 0,
              transformOrigin: "left",
            }}
            className="how-connector"
          />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.stamp}
              initial={prefersReduced ? {} : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.12 }}
              style={{
                padding: "0 2.5rem",
                borderRight:
                  i < STEPS.length - 1
                    ? "1px solid rgba(19,25,41,0.1)"
                    : "none",
                position: "relative",
                zIndex: 1,
                textAlign: "center",
              }}
              className="how-step"
            >
              {/* Stamp circle */}
              <div
                style={{
                  width: "104px",
                  height: "104px",
                  margin: "0 auto 2rem",
                  position: "relative",
                }}
              >
                <svg
                  width="104"
                  height="104"
                  viewBox="0 0 104 104"
                  fill="none"
                  style={{ position: "absolute", inset: 0 }}
                >
                  <circle cx="52" cy="52" r="50" stroke={s.accent} strokeWidth="1.5" />
                  <circle
                    cx="52"
                    cy="52"
                    r="44"
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
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.52rem",
                      fontWeight: 400,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: s.accent,
                    }}
                  >
                    {s.stamp}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#131929",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.verb}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#131929",
                  marginBottom: "0.75rem",
                  lineHeight: 1.25,
                }}
              >
                {s.headline}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "#6A6355",
                  marginBottom: "1rem",
                }}
              >
                {s.body}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.62rem",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: s.accent,
                  padding: "0.4rem 0.75rem",
                  border: `1px solid ${s.accent}`,
                  display: "inline-block",
                  opacity: 0.85,
                }}
              >
                {s.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr !important; }
          .how-step { border-right: none !important; border-bottom: 1px solid rgba(19,25,41,0.1); padding: 2rem 1rem; }
          .how-step:last-child { border-bottom: none; }
          .how-connector { display: none; }
        }
      `}</style>
    </section>
  );
}
