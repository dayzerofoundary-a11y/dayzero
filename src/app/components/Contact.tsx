import { motion, useReducedMotion } from "motion/react";
import { GuillocheBackground } from "./GuillocheBackground";
import { Mail, Phone } from "lucide-react";

const CONTACTS = [
  {
    name: "Siddardh Vanguri",
    role: "Founder & Director",
    email: "siddardh.vanguri@gmail.com",
    phone: "+91 9121010161",
    label: "SV",
  },
  {
    name: "Abhinav Rishi Saka",
    role: "Founder & CEO",
    email: "abhinavrishisaka@gmail.com",
    phone: "+91 9618587055",
    label: "AR",
  },
  {
    name: "Shlok Karn",
    role: "Founder & CTO",
    email: "karnshlok3@gmail.com",
    phone: "+91 70132 66120",
    label: "SK",
  },
];

export function Contact() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="contact"
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
            Contact Us · Section VII
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
            Direct lines to the founders.
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
            No gatekeepers, no sales pitches. Speak directly with the leaders who shape and execute your vision.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
          className="contact-grid"
        >
          {CONTACTS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.15 }}
              whileHover={prefersReduced ? {} : { y: -6, scale: 1.015, transition: { type: "spring", stiffness: 350, damping: 25 } }}
              style={{
                background: "#EAE4D6",
                border: "1px solid rgba(168,130,44,0.35)",
                padding: "2.5rem 2.25rem",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                boxShadow: "0 4px 20px rgba(19,25,41,0.03)",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(168,130,44,0.7)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(168,130,44,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(168,130,44,0.35)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(19,25,41,0.03)";
              }}
            >
              {/* Initials Watermark */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "3.5rem",
                  fontWeight: 700,
                  color: "rgba(168,130,44,0.05)",
                  lineHeight: 1,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {c.label}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#131929",
                    marginBottom: "0.25rem",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#A8822C",
                  }}
                >
                  {c.role}
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(168,130,44,0.2)",
                  width: "100%",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a
                  href={`mailto:${c.email}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#131929",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#A8822C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#131929")}
                >
                  <Mail size={16} style={{ color: "#A8822C" }} />
                  <span>{c.email}</span>
                </a>

                <a
                  href={`tel:${c.phone}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.9rem",
                    color: "#131929",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#A8822C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#131929")}
                >
                  <Phone size={16} style={{ color: "#A8822C" }} />
                  <span>{c.phone}</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .contact-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}
