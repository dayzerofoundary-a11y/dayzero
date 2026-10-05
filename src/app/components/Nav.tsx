import { useState, useEffect } from "react";

interface NavProps {
  onDraftClick: () => void;
}

export function Nav({ onDraftClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handler = () => {
      const sy = window.scrollY;
      setScrolled(sy > 20);

      const sections = ["hero", "draft", "sealed", "certified", "pillars", "how", "team", "contact"];
      let active = "hero";
      const scrollThreshold = sy + 80;
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
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const darkSections = ["hero", "sealed", "pillars", "team"];
  const isDarkNav = darkSections.includes(activeSection);
  const textColor = isDarkNav ? "#F4EFE4" : "#131929";
  const mutedColor = isDarkNav ? "rgba(244, 239, 228, 0.75)" : "#6A6355";

  let headerBg = "transparent";
  let borderBottom = "1px solid transparent";
  let backdropFilter = "none";

  if (scrolled) {
    backdropFilter = "blur(16px) saturate(180%)";
    if (isDarkNav) {
      headerBg = "rgba(19, 25, 41, 0.85)";
      borderBottom = "1px solid rgba(168, 130, 44, 0.2)";
    } else {
      headerBg = "rgba(244, 239, 228, 0.88)";
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
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
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
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          className="brand-lockup"
        >
          <a
            href="#hero"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "baseline",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "1.55rem",
                fontWeight: 600,
                color: textColor,
                letterSpacing: "0.01em",
                transition: "color 0.3s",
              }}
            >
              DayZero
              <span style={{ color: "#A8822C" }}>Foundary</span>
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: mutedColor,
                transition: "color 0.3s",
              }}
              className="brand-kicker"
            >
              by Veixon
            </span>
          </a>

          {/* Live Studio Status Pill */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(168, 130, 44, 0.08)",
              border: "1px solid rgba(168, 130, 44, 0.25)",
              padding: "0.2rem 0.6rem",
              borderRadius: "100px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.55rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#A8822C",
              }}
            >
              Operations Active
            </span>
          </div>
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
          ].map(([label, href]) => {
            const id = href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: isActive ? "#A8822C" : mutedColor,
                  textDecoration: "none",
                  transition: "color 0.2s, font-weight 0.2s",
                  position: "relative",
                  paddingBottom: "4px",
                }}
              >
                {label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      background: "#A8822C",
                    }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* CTA Button */}
        <button
          onClick={onDraftClick}
          aria-label="File a Draft"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 1.25rem",
            background: "#A8822C",
            border: "1px solid #C9A24A",
            color: "#F4EFE4",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s ease-out",
            borderRadius: "2px",
            boxShadow: "0 4px 14px rgba(168,130,44,0.3)",
          }}
          className="nav-cta"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#C9A24A";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(168,130,44,0.45)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#A8822C";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(168,130,44,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <SealMark />
          <span className="nav-cta-label">File a Draft</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .primary-nav { display: none !important; }
        }
        @media (max-width: 900px) {
          .site-header-inner { height: 60px !important; padding: 0 1rem !important; }
          .brand-lockup { gap: 0.45rem !important; }
          .brand-kicker { display: none !important; }
          .nav-cta-label { display: none !important; }
          .nav-cta {
            width: 40px !important;
            height: 40px !important;
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
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "4px", fontWeight: 400 }}
      >
        DZF
      </text>
    </svg>
  );
}
