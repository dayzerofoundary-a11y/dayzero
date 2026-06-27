import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";
import { FileSignature, Users, LockKeyhole } from "lucide-react";

const GUARANTEES = [
  {
    icon: FileSignature,
    title: "Signed before a word is said.",
    body: "A legally binding Non-Disclosure Agreement (NDA) is executed before any detail of the idea is submitted. You do not commit to anything; we do.",
  },
  {
    icon: Users,
    title: "Seen only by the build team.",
    body: "No manager, no partner, no investor — only the engineers assigned to your project have access. The circle is small and documented.",
  },
  {
    icon: LockKeyhole,
    title: "Never reused, sold, or disclosed.",
    body: "Nothing about the idea, or about you, is ever disclosed to anyone — including your employer. You retain one hundred percent of the intellectual property.",
  },
];

export function SignedAndSealed() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="sealed"
      style={{
        background: "#131929",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GuillocheBackground color="#F4EFE4" opacity={0.035} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Centered Header Section (styled like The Draft) */}
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
            Signed &amp; Sealed · Section II
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#C9A24A",
              marginBottom: "2rem",
              textAlign: "center",
              margin: "0 auto 2rem",
              maxWidth: "800px",
            }}
          >
            We sign before you say <span style={{ fontStyle: "italic", color: "#F4EFE4" }}>a word.</span>
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(244,239,228,0.65)",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            Disclosing an unbuilt idea carries real risk. We have structured the
            engagement so that the only party with any obligation, before you share
            anything, is us.
          </p>
        </motion.div>

        {/* Horizontal NDA Card */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          style={{
            border: "1px solid rgba(168, 130, 44, 0.35)",
            padding: "5px",
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto 4rem",
            background: "rgba(168, 130, 44, 0.02)",
          }}
          className="sealed-card-wrapper"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
              padding: "2rem 2.5rem",
              border: "1px solid rgba(168, 130, 44, 0.15)",
              background: "radial-gradient(circle at top left, rgba(168,130,44,0.08), rgba(19,25,41,0.6))",
              width: "100%",
            }}
            className="sealed-card-inner"
          >
            {/* Left side: NDA circle badge + title & ref */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
              }}
              className="sealed-card-left"
            >
              {/* Circle badge */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  border: "1.5px solid #A8822C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: "#C9A24A",
                  }}
                >
                  NDA
                </span>
              </div>
              <div style={{ textAlign: "left" }} className="sealed-card-text">
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#F4EFE4",
                    marginBottom: "0.4rem",
                  }}
                >
                  Non-Disclosure Agreement
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "rgba(244,239,228,0.55)",
                    letterSpacing: "0.08em",
                  }}
                >
                  Filed on record · Ref {new Date().getFullYear()}-DZF
                </div>
              </div>
            </div>

            {/* Right side: EXECUTED Before disclosure */}
            <div style={{ textAlign: "right" }} className="sealed-card-right">
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  color: "rgba(244,239,228,0.45)",
                  textTransform: "uppercase",
                  marginBottom: "0.3rem",
                }}
              >
                EXECUTED
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "#C9A24A",
                }}
              >
                Before disclosure
              </div>
            </div>
          </div>
        </motion.div>
        {/* Guarantees 3-column layout styled like Section IV (Pillars) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(168, 130, 44, 0.35)",
            border: "1px solid rgba(168, 130, 44, 0.35)",
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
          className="guarantees-grid"
        >
          {GUARANTEES.map((g, i) => (
            <motion.div
              key={g.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.1 }}
              whileHover={prefersReduced ? {} : { scale: 1.025, backgroundColor: "rgba(26, 34, 56, 0.85)", y: -4, zIndex: 10 }}
              style={{
                backgroundColor: "rgba(19, 25, 41, 0.75)",
                padding: "3rem 2rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "default",
              }}
            >
              {/* Large background watermark icon */}
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
                <g.icon size={140} strokeWidth={1} />
              </div>

              {/* Gold Icon */}
              <div
                style={{
                  color: "#A8822C",
                  marginBottom: "1.2rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <g.icon size={26} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#F4EFE4",
                  marginBottom: "1rem",
                  lineHeight: 1.3,
                }}
              >
                {g.title}
              </h3>

              {/* Body text */}
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(244,239,228,0.6)",
                  margin: 0,
                  flex: 1,
                }}
              >
                {g.body}
              </p>

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
        @media (max-width: 768px) {
          .sealed-card-inner {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1.5rem !important;
            padding: 2rem 1.5rem !important;
          }
          .sealed-card-left {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .sealed-card-text {
            text-align: center !important;
          }
          .sealed-card-right {
            text-align: center !important;
          }
          .guarantees-grid {
            grid-template-columns: 1fr !important;
            gap: 1px !important;
          }
        }
      `}</style>
    </section>
  );
}
