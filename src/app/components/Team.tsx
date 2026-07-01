import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";
import { UserCheck, Network, ShieldCheck, Award } from "lucide-react";

const ATTRIBUTES = [
  {
    icon: UserCheck,
    label: "Employed by you",
    desc: "For the duration of the build, we work as part of your team. We focus only on your project and build it as if it were our own.",
  },
  {
    icon: Network,
    label: "No agency structure",
    desc: "You'll work directly with the engineers building your product. No account managers. No unnecessary back and forth.",
  },
  {
    icon: ShieldCheck,
    label: "No competing interests",
    desc: "We don't take equity in your idea, and we don't work on competing products while your project is active. Our focus stays on your build.",
  },
  {
    icon: Award,
    label: "Reviewed by experienced builders",
    desc: "Every MVP is reviewed by senior engineers and product leaders before it's delivered. Nothing is handed over until it meets our quality standards.",
  },
];

export function Team() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="team"
      style={{
        background: "#0D1220",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GuillocheBackground color="#F4EFE4" opacity={0.03} />

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
            The Build Team · Section VI
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
            We are your employees <span style={{ fontStyle: "italic", color: "#A8822C" }}>here.</span>
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(244,239,228,0.6)",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            The framing matters. A vendor sells you hours. An employee works toward
            your outcome. We operate as the latter — on-call, discreet, and accountable
            to your success rather than to a statement of work. This is the only
            arrangement under which we work. There are no other clients in the room
            when your project is on the table.
          </p>
        </motion.div>

        {/* Horizontal Certificate of Appointment Card */}
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
          className="team-card-wrapper"
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
            className="team-card-inner"
          >
            {/* Left side: Team circle badge + title & ref */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
              }}
              className="team-card-left"
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
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: "#C9A24A",
                  }}
                >
                  TEAM
                </span>
              </div>
              <div style={{ textAlign: "left" }} className="team-card-text">
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#F4EFE4",
                    marginBottom: "0.4rem",
                  }}
                >
                  Certificate of Appointment
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
                  Filed on record · Founding Director, DayZeroFoundry
                </div>
              </div>
            </div>

            {/* Right side: STATUS */}
            <div style={{ textAlign: "right" }} className="team-card-right">
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
                STATUS
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "#C9A24A",
                }}
              >
                Active build
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attributes 4-column layout styled like Section IV (Pillars) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "rgba(168, 130, 44, 0.35)",
            border: "1px solid rgba(168, 130, 44, 0.35)",
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
          className="team-grid"
        >
          {ATTRIBUTES.map((a, i) => (
            <motion.div
              key={a.label}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.08 }}
              whileHover={prefersReduced ? {} : { scale: 1.025, backgroundColor: "rgba(26, 34, 56, 0.85)", y: -4, zIndex: 10 }}
              style={{
                backgroundColor: "rgba(19, 25, 41, 0.75)",
                padding: "2.5rem 1.5rem",
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
                <a.icon size={130} strokeWidth={1} />
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
                <a.icon size={26} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "#F4EFE4",
                  marginBottom: "0.8rem",
                  lineHeight: 1.3,
                }}
              >
                {a.label}
              </h3>

              {/* Body text */}
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color: "rgba(244,239,228,0.6)",
                  margin: 0,
                  flex: 1,
                }}
              >
                {a.desc}
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
        @media (max-width: 900px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1px !important;
          }
        }
        @media (max-width: 768px) {
          .team-card-inner {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1.5rem !important;
            padding: 2rem 1.5rem !important;
          }
          .team-card-left {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .team-card-text {
            text-align: center !important;
          }
          .team-card-right {
            text-align: center !important;
          }
        }
        @media (max-width: 580px) {
          .team-grid {
            grid-template-columns: 1fr !important;
            gap: 1px !important;
          }
        }
      `}</style>
    </section>
  );
}
