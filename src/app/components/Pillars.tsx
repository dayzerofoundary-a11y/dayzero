import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";
import { Clock, Hammer, Shield, Award, Banknote } from "lucide-react";

const PILLARS = [
  {
    icon: Clock,
    title: "Time",
    tagline: "You focus on the idea.",
    body: "From planning to delivery, we handle the build. Your involvement is limited to the kickoff and the final review.",
    accent: "#A8822C",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Hammer,
    title: "Effort",
    tagline: "We build it.",
    body: "Design, development, testing, and deployment are handled by our team, so you can stay focused on your work.",
    accent: "#C9A24A",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Shield,
    title: "Security",
    tagline: "Protected from day one.",
    body: "We sign the NDA before you share your idea. Your idea is protected from the moment you contact us.",
    accent: "#A8822C",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Award,
    title: "Quality",
    tagline: "Reviewed before delivery.",
    body: "Every MVP is reviewed before delivery. We only ship builds we are confident in.",
    accent: "#C9A24A",
    span: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Banknote,
    title: "Cost",
    tagline: "Free to start.",
    body: "Your first MVP is built at no cost. If you choose to continue after the MVP, you can add development, scaling, or custom features as your product grows.",
    accent: "#A8822C",
    span: "col-span-1 md:col-span-3 lg:col-span-3",
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

      {/* Grid line accent */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(244,239,228,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,239,228,0.035) 1px, transparent 1px)",
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
            Five Denominations · Section IV
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#F4EFE4",
              marginBottom: "1rem",
              textAlign: "center",
              margin: "0 auto 1.5rem",
              maxWidth: "800px",
            }}
          >
            What every engagement is worth.
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              color: "rgba(244, 239, 228, 0.75)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Guaranteed principles backed by our NDA shield and stealth execution framework.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
          }}
          className="pillars-bento-grid"
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.06 }}
              whileHover={
                prefersReduced
                  ? {}
                  : {
                      y: -4,
                      borderColor: "rgba(168, 130, 44, 0.6)",
                      boxShadow: "0 12px 32px rgba(168, 130, 44, 0.12)",
                    }
              }
              style={{
                backgroundColor: "rgba(19, 25, 41, 0.8)",
                border: "1px solid rgba(168, 130, 44, 0.2)",
                borderRadius: "4px",
                padding: "2.25rem 1.75rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                gridColumn: i === 0 ? "span 2" : i === 4 ? "span 3" : "span 1",
              }}
              className="bento-card"
            >
              {/* Radial subtle ambient glow */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  background: "radial-gradient(circle, rgba(168,130,44,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    color: p.accent,
                    background: "rgba(168, 130, 44, 0.08)",
                    padding: "0.6rem",
                    borderRadius: "4px",
                    display: "inline-flex",
                    border: "1px solid rgba(168, 130, 44, 0.2)",
                  }}
                >
                  <p.icon size={22} strokeWidth={1.5} />
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(168, 130, 44, 0.6)",
                  }}
                >
                  DENOMINATION 0{i + 1}
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.65rem",
                  fontWeight: 500,
                  color: "#F4EFE4",
                  lineHeight: 1.2,
                }}
              >
                {p.title}
              </div>

              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: p.accent,
                  textTransform: "uppercase",
                }}
              >
                {p.tagline}
              </div>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  lineHeight: 1.65,
                  color: "rgba(244, 239, 228, 0.82)",
                  marginTop: "0.25rem",
                }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .pillars-bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-card {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
