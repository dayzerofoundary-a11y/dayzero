import { useState, useEffect } from "react";

interface NavProps {
  onDraftClick: () => void;
}

export function Nav({ onDraftClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handler = () => {
      const sy = window.scrollY;
      setScrolled(sy > 20);
      setPastHero(sy > window.innerHeight - 68);

      const sections = ["hero", "draft", "sealed", "certified", "pillars", "how", "team", "contact"];
      let active = "hero";
      const scrollThreshold = sy + 70; // middle of navbar height
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollThreshold >= top && scrollThreshold < top + height) {
            active = id;
            break;
          }
        }
      }
      setActiveSection(active);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler(); // Run once initially
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const darkSections = ["hero", "sealed", "pillars", "team"];
  const isDarkNav = darkSections.includes(activeSection);
  const textColor = isDarkNav ? "#F4EFE4" : "#131929";
  const mutedColor = isDarkNav ? "rgba(244,239,228,0.65)" : "#6A6355";

  let headerBg = "transparent";
  let borderBottom = "1px solid transparent";
  let backdropFilter = "none";

  if (scrolled) {
    backdropFilter = "blur(12px)";
    if (isDarkNav) {
      headerBg = "rgba(19, 25, 41, 0.85)";
      borderBottom = "1px solid rgba(244, 239, 228, 0.08)";
    } else {
      headerBg = "rgba(244, 239, 228, 0.85)";
      borderBottom = "1px solid rgba(19, 25, 41, 0.12)";
    }
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
        background: headerBg,
        backdropFilter: backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        borderBottom: borderBottom,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="site-header-inner"
      >
        {/* Wordmark */}
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}
          className="brand-lockup"
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.55rem",
              fontWeight: 600,
              color: textColor,
              letterSpacing: "0.01em",
              transition: "color 0.4s",
            }}
          >
            DayZero
            <span style={{ color: "#A8822C" }}>Foundry</span>
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: mutedColor,
              transition: "color 0.4s",
            }}
            className="brand-kicker"
          >
            by Veixon
          </span>
        </div>

        {/* Nav links — desktop */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.25rem",
          }}
          className="primary-nav hidden md:flex"
        >
          {[
            ["The Draft", "#draft"],
            ["Confidentiality", "#sealed"],
            ["Certification", "#certified"],
            ["How It Works", "#how"],
            ["Contact Us", "#contact"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 400,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: mutedColor,
                textDecoration: "none",
                transition: "color 0.25s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = textColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = mutedColor)}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA — Seal button */}
        <button
          onClick={onDraftClick}
          aria-label="File a Draft"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 1.1rem",
            background: scrolled ? "#A8822C" : "transparent",
            border: "1px solid #A8822C",
            color: scrolled ? "#F4EFE4" : "#A8822C",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.5s, color 0.5s, border-color 0.5s, transform 0.1s",
            borderRadius: "0",
            boxShadow: scrolled ? "0 4px 14px rgba(168,130,44,0.25)" : "none",
          }}
          className="nav-cta"
          onMouseEnter={(e) => {
            if (scrolled) {
              e.currentTarget.style.background = "#8c6a21";
              e.currentTarget.style.borderColor = "#8c6a21";
            } else {
              e.currentTarget.style.background = "#A8822C";
              e.currentTarget.style.color = "#F4EFE4";
            }
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = scrolled ? "#A8822C" : "transparent";
            e.currentTarget.style.borderColor = "#A8822C";
            e.currentTarget.style.color = scrolled ? "#F4EFE4" : "#A8822C";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(1px)";
          }}
        >
          <SealMark />
          <span className="nav-cta-label">File a Draft</span>
        </button>
      </div>
      <style>{`
        @media (max-width: 1080px) {
          .primary-nav {
            display: none !important;
          }
        }

        @media (max-width: 900px) {
          .site-header-inner {
            height: 60px !important;
            padding: 0 1rem !important;
          }
          .brand-lockup {
            gap: 0.45rem !important;
            min-width: 0 !important;
          }
          .brand-kicker {
            display: none !important;
          }
          .nav-cta {
            padding: 0.5rem 0.75rem !important;
            letter-spacing: 0.12em !important;
            flex-shrink: 0 !important;
          }
          .nav-cta-label {
            display: none !important;
          }
          .nav-cta {
            width: 42px !important;
            height: 42px !important;
            justify-content: center !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </header>
  );
}

function SealMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
      <text
        x="8"
        y="11"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "4px", fontWeight: 700 }}
      >
        DZF
      </text>
    </svg>
  );
}
