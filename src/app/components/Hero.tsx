import React, { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";

interface HeroProps {
  draftRef: React.RefObject<HTMLElement | null>;
}

export function Hero({ draftRef }: HeroProps) {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shimmerPos, setShimmerPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReduced) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -ny * 5, y: nx * 8 });

    const cardEl = (e.currentTarget as HTMLElement).querySelector(".check-card");
    if (cardEl) {
      const cr = cardEl.getBoundingClientRect();
      setShimmerPos({
        x: ((e.clientX - cr.left) / cr.width) * 100,
        y: ((e.clientY - cr.top) / cr.height) * 100,
      });
    }
  }, [prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const scrollToDraft = () => {
    draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        background: "#131929",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: "68px",
      }}
      className="hero-section"
    >
      <GuillocheBackground color="#F4EFE4" opacity={0.04} />

      {/* DZF watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(8rem, 22vw, 22rem)",
          fontWeight: 700,
          color: "rgba(244,239,228,0.025)",
          letterSpacing: "0.05em",
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        DZF
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "4.5rem 2rem 4.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
        className="hero-grid"
      >
        {/* Left — copy */}
        <div style={{ display: "flex", flexDirection: "column" }} className="hero-copy-block">
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#A8822C",
              marginBottom: "1.5rem",
            }}
            className="hero-kicker"
          >
            <span style={{ opacity: 0.7, marginRight: "0.5rem" }}>✤</span>
            DayZeroFoundry · A Veixon Institution
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
              fontWeight: 600,
              lineHeight: 1.12,
              color: "#F4EFE4",
              marginBottom: "1.5rem",
              maxWidth: "540px",
            }}
            className="hero-title"
          >
            Every idea is currency.{" "}
            <em
              className="hero-emphasis"
              style={{ color: "#C9A24A", fontStyle: "italic" }}
            >
              <span>We mint yours</span>
              <span>into a real product.</span>
            </em>
          </motion.h1>

          <motion.p
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(244,239,228,0.72)",
              maxWidth: "460px",
              marginBottom: "2.5rem",
            }}
            className="hero-copy"
          >
             A working MVP built completely <strong style={{ color: "#C9A24A", fontWeight: 700, fontStyle: "italic", textDecoration: "underline", textDecorationColor: "rgba(201,162,74,0.4)", textUnderlineOffset: "4px" }}>at zero cost</strong>, certified by industry veterans and shipped under NDA.
          </motion.p>

          {/* Trust strip */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0",
              marginBottom: "1rem",
              borderTop: "1px dashed rgba(168,130,44,0.35)",
              borderBottom: "1px dashed rgba(168,130,44,0.35)",
              padding: "0.75rem 0",
            }}
            className="trust-strip"
          >
            {[
              ["Your MVP cost", "Zero Cost"],
              ["Built by", "Veixon Team"],
              ["Trusted & Checked by", "Industry Veterans"],
            ].map(([label, value], i) => (
              <div
                key={label}
                style={{
                  flex: "1 1 auto",
                  padding: "0.35rem 1.25rem",
                  borderRight: i < 2 ? "1px solid rgba(168,130,44,0.25)" : "none",
                  textAlign: "center",
                }}
                className="trust-item"
              >
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.55rem",
                    fontWeight: 500,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(244,239,228,0.65)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#C9A24A",
                    letterSpacing: "0.02em",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </motion.div>


        </div>

        {/* Right — 3D Check & Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.95, rotateY: -15, y: 40 }}
            animate={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, rotateY: 0, y: [0, -6, 0] }}
            transition={
              prefersReduced
                ? { duration: 0.7 }
                : {
                    opacity: { duration: 0.9, ease: "easeOut", delay: 0.3 },
                    scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                    rotateY: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
                    y: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 4.5,
                      ease: "easeInOut",
                      delay: 1.4,
                    },
                  }
            }
            style={{ display: "flex", justifyContent: "center", perspective: "1200px", width: "100%" }}
          >
          <div
            className="check-card"
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#F0EBE0",
              border: "4px double #A8822C",
              position: "relative",
              overflow: "hidden",
              transform: prefersReduced
                ? "none"
                : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: prefersReduced ? "none" : "transform 0.12s ease",
              boxShadow: "0 32px 80px rgba(13,18,32,0.55), 0 4px 20px rgba(13,18,32,0.4)",
            }}
          >
            {/* Guilloché fill */}
            <GuillocheBackground color="#131929" opacity={0.05} />

            {/* Foil shimmer overlay */}
            <div
              aria-hidden
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at ${shimmerPos.x}% ${shimmerPos.y}%, rgba(201,162,74,0.12) 0%, transparent 55%)`,
                pointerEvents: "none",
                zIndex: 10,
                transition: "background 0.1s",
              }}
            />

            {/* Check content */}
            <div style={{ position: "relative", zIndex: 2, padding: "1.5rem 1.75rem 1.25rem" }}>
              {/* Check header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "baseline",
                      gap: "0.15rem",
                      color: "#131929",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                      }}
                    >
                      DayZero
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        fontStyle: "italic",
                        color: "#A8822C",
                      }}
                    >
                      Foundry
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      color: "#6A6355",
                      marginTop: "0.2rem",
                      lineHeight: 1,
                    }}
                  >
                    a Veixon Institution
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.52rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#6A6355",
                    }}
                  >
                    No.
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#131929",
                    }}
                  >
                    DZ-00-0001
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(168,130,44,0.35)",
                  marginBottom: "1rem",
                }}
              />

              {/* Pay to */}
              <div style={{ marginBottom: "0.9rem" }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.55rem",
                    fontWeight: 400,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#6A6355",
                    marginBottom: "0.25rem",
                  }}
                >
                  Pay to the order of
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(19,25,41,0.2)",
                    paddingBottom: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "#131929",
                      fontStyle: "italic",
                    }}
                  >
                    Your Idea
                  </span>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#131929",
                      border: "1px solid rgba(19,25,41,0.25)",
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    ₹ INVALUABLE
                  </span>
                </div>
              </div>

              {/* Memo */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.55rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#6A6355",
                    marginBottom: "0.2rem",
                  }}
                >
                  Memo
                </div>
                <div
                  style={{
                    borderBottom: "1px solid rgba(19,25,41,0.2)",
                    paddingBottom: "0.3rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: "#131929",
                  }}
                >
                  One working MVP · Confidential
                </div>
              </div>

              {/* Signature */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "0.8rem",
                }}
              >
                <div>
                  <div
                    style={{
                      borderBottom: "1px solid rgba(19,25,41,0.2)",
                      paddingBottom: "0.25rem",
                      minWidth: "160px",
                      fontFamily: "'Pinyon Script', cursive",
                      fontSize: "1.6rem",
                      color: "#1E2535",
                      lineHeight: 1,
                    }}
                  >
                    Your Signature
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.5rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#6A6355",
                      marginTop: "0.25rem",
                    }}
                  >
                    Authorised Signatory
                  </div>
                </div>
                <CertifiedStamp small />
              </div>

              {/* MICR line */}
              <div
                style={{
                  borderTop: "1px solid rgba(19,25,41,0.12)",
                  paddingTop: "0.6rem",
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "0.6rem",
                  color: "#131929",
                  letterSpacing: "0.08em",
                  opacity: 0.55,
                }}
              >
                ⌐ 00-1729 ⌐ 17290001 ⌐ 0000001 ⌐
              </div>
            </div>

            {/* Perforated left edge */}
            <PerforatedEdge />
          </div>
        </motion.div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", width: "100%", marginTop: "2rem" }}
          className="hero-actions"
        >
          <button
            onClick={scrollToDraft}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.9rem 2rem",
              background: "#A8822C",
              color: "#F4EFE4",
              border: "1px solid #A8822C",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#C9A24A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#A8822C")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Draft Your Idea
          </button>
          <button
            onClick={() =>
              document.getElementById("sealed")?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.9rem 1.75rem",
              background: "transparent",
              color: "#C9A24A",
              border: "1px solid rgba(201,162,74,0.4)",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#F4EFE4";
              e.currentTarget.style.borderColor = "#C9A24A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#C9A24A";
              e.currentTarget.style.borderColor = "rgba(201,162,74,0.4)";
            }}
          >
            Our Commitment
          </button>
        </motion.div>
      </div>
      </div>

      <style>{`
        .hero-copy-block,
        .hero-title,
        .hero-copy,
        .hero-note,
        .trust-strip,
        .hero-actions {
          max-width: min(680px, calc(100vw - 2rem)) !important;
        }

        .hero-title,
        .hero-copy {
          overflow-wrap: break-word;
        }

        .hero-emphasis,
        .hero-emphasis span {
          display: block;
        }

        @media (max-width: 1024px) {
          .hero-section {
            min-height: auto !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 5rem 1.25rem 4rem !important;
          }
          .hero-copy-block {
            max-width: 680px !important;
          }
          .hero-grid > div:last-child {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          .hero-grid {
            padding: 2rem 1rem 3.5rem !important;
          }
          .hero-kicker {
            letter-spacing: 0.05em !important;
            line-height: 1.2 !important;
            margin-bottom: 1rem !important;
          }
          .hero-title {
            font-size: clamp(2.1rem, 10vw, 3.1rem) !important;
            max-width: min(340px, calc(100vw - 2rem)) !important;
          }
          .hero-copy {
            font-size: 0.98rem !important;
            max-width: min(340px, calc(100vw - 2rem)) !important;
          }
          .hero-note {
            max-width: min(340px, calc(100vw - 2rem)) !important;
          }
          .trust-strip {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .trust-item {
            border-right: 0 !important;
            border-bottom: 1px solid rgba(168,130,44,0.22) !important;
          }
          .trust-item:last-child {
            border-bottom: 0 !important;
          }
          .hero-actions {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .hero-actions button {
            width: 100% !important;
          }
        }

        @media (max-width: 420px) {
          .hero-title {
            font-size: clamp(1.95rem, 9vw, 2.5rem) !important;
          }
          .hero-copy {
            font-size: 0.94rem !important;
          }
        }
      `}</style>
    </section>
  );
}

const CertifiedStamp = React.memo(function CertifiedStamp({ small = false }: { small?: boolean }) {
  const size = small ? 80 : 105;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.82, transform: "rotate(-18deg)", flexShrink: 0 }}
    >
      <circle cx="45" cy="45" r="40" stroke="#1A4A3C" strokeWidth="2.5" />
      <circle cx="45" cy="45" r="35" stroke="#1A4A3C" strokeWidth="0.75" strokeDasharray="3 2" />
      <text
        x="45"
        y="41"
        textAnchor="middle"
        fill="#1A4A3C"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", fontWeight: 600, letterSpacing: "0.25em" }}
      >
        CERTIFIED
      </text>
      <text
        x="45"
        y="53"
        textAnchor="middle"
        fill="#1A4A3C"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "5px", fontWeight: 400, letterSpacing: "0.2em" }}
      >
        DAYZERO FOUNDRY
      </text>
    </svg>
  );
});

const PerforatedEdge = React.memo(function PerforatedEdge() {
  const count = 22;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: "8px",
        paddingBottom: "8px",
        background: "rgba(168,130,44,0.06)",
        borderRight: "1px dashed rgba(168,130,44,0.3)",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#F4EFE4",
            border: "1px solid rgba(168,130,44,0.3)",
          }}
        />
      ))}
    </div>
  );
});

export { CertifiedStamp, PerforatedEdge };
