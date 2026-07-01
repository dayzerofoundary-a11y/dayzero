import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";

const CRITERIA = [
  "Fully functional from start to finish — no unfinished features.",
  "Secure by design — authentication and access controls are in place.",
  "Ready to deploy — delivered in a working, runnable state.",
  "Documented for handoff — your team can continue with confidence.",
  "Built with focus — only the features that matter, nothing unnecessary.",
];

export function VerifiedCertified() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="certified"
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
            Verified &amp; Certified · Section III
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
            Nothing ships without the stamp.
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              lineHeight: 1.75,
              color: "#6A6355",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            Every MVP is reviewed before delivery. The certificate confirms that <br />
            the build meets our internal quality standards.
          </p>
        </motion.div>

        {/* Certificate visual */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          style={{
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#EAE4D6",
              border: "1px solid rgba(168,130,44,0.45)",
              padding: "0",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(19,25,41,0.1)",
            }}
          >
            <GuillocheBackground color="#131929" opacity={0.04} />

            {/* Certificate inner border */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                margin: "16px",
                border: "1px solid rgba(168,130,44,0.3)",
                padding: "2.5rem 3rem",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.55rem",
                    fontWeight: 400,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "#1A4A3C",
                    marginBottom: "0.75rem",
                  }}
                >
                  Certificate of Authentication
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.8rem",
                    fontWeight: 600,
                    color: "#131929",
                    marginBottom: "0.25rem",
                  }}
                >
                  DayZeroFoundry
                </div>
                <div
                  style={{
                    width: "80px",
                    height: "2px",
                    background: "#A8822C",
                    margin: "0.75rem auto",
                  }}
                />
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 300,
                    color: "#6A6355",
                    letterSpacing: "0.12em",
                  }}
                >
                  hereby certifies that the following build criteria have been satisfied
                </div>
              </div>

              {/* Criteria */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  marginBottom: "2rem",
                }}
              >
                {CRITERIA.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={prefersReduced ? {} : { opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "0.75rem 0",
                      borderBottom:
                        i < CRITERIA.length - 1
                          ? "1px solid rgba(19,25,41,0.08)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        background: "#1A4A3C",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "1px",
                      }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <motion.path
                          d="M1 4L3.8 6.5L9 1.5"
                          stroke="#F4EFE4"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={prefersReduced ? {} : { pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 + 0.2 }}
                        />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.88rem",
                        fontWeight: 300,
                        lineHeight: 1.6,
                        color: "#131929",
                      }}
                    >
                      {c}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid rgba(168,130,44,0.3)",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Pinyon Script', cursive",
                      fontSize: "1.8rem",
                      color: "#131929",
                      lineHeight: 1,
                      marginBottom: "0.25rem",
                    }}
                  >
                    Veixon Industries
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.52rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#6A6355",
                    }}
                  >
                    Chief of Certification · DayZeroFoundry
                  </div>
                </div>

                 {/* Emerald stamp */}
                 <motion.div
                   initial={prefersReduced ? {} : { rotate: -25, scale: 0.85, opacity: 0 }}
                   whileInView={{ rotate: -5, scale: 1, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                   style={{ flexShrink: 0 }}
                 >
                   <CertifiedEmeraldStamp />
                 </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CertifiedEmeraldStamp() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke="#1A4A3C" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" stroke="#1A4A3C" strokeWidth="0.75" strokeDasharray="2.5 2" />
      <circle cx="50" cy="50" r="33" fill="rgba(26,74,60,0.08)" />
      <text x="50" y="44" textAnchor="middle" fill="#1A4A3C"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", fontWeight: 700, letterSpacing: "0.3em" }}>
        CERTIFIED
      </text>
      <text x="50" y="57" textAnchor="middle" fill="#1A4A3C"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", fontWeight: 700 }}>
        DZF
      </text>
      <text x="50" y="68" textAnchor="middle" fill="rgba(26,74,60,0.7)"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "5px", letterSpacing: "0.2em" }}>
        VERIFIED BUILD
      </text>
    </svg>
  );
}
