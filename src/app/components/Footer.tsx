import { useState, useEffect } from "react";

export function Footer() {
  const [timeState, setTimeState] = useState({ ist: "", utc: "" });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const utcString = now.toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTimeState({ ist: istString, utc: utcString });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      style={{
        background: "#0D1220",
        borderTop: "1px solid rgba(168,130,44,0.25)",
        padding: "4rem 2rem 2.5rem",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        {/* Left Column — Branding */}
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.45rem",
              fontWeight: 500,
              color: "#F4EFE4",
              letterSpacing: "0.01em",
              marginBottom: "0.4rem",
            }}
          >
            DayZero<span style={{ color: "#A8822C" }}>Foundary</span>
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.62rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(244, 239, 228, 0.65)",
              marginBottom: "1.25rem",
            }}
          >
            A Veixon Product · Est. {new Date().getFullYear()}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.65rem",
              color: "#A8822C",
              letterSpacing: "0.08em",
            }}
          >
            <span>IST: {timeState.ist || "12:00:00"}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>UTC: {timeState.utc || "06:30:00"}</span>
          </div>
        </div>

        {/* Center Column — Tagline */}
        <div style={{ textAlign: "center", maxWidth: "340px" }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 300,
              letterSpacing: "0.15em",
              color: "#F4EFE4",
              lineHeight: 1.6,
            }}
          >
            Every idea is currency.
            <br />
            <span style={{ color: "#C9A24A", fontWeight: 500 }}>
              We mint yours into a market-ready product.
            </span>
          </div>
        </div>

        {/* Right Column — Contact & Back to Top */}
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <a
            href="mailto:hello@dayzero.build"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "#C9A24A",
              textDecoration: "none",
              borderBottom: "1px solid rgba(201,162,74,0.4)",
              paddingBottom: "2px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A24A")}
          >
            hello@dayzero.build
          </a>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "rgba(244,239,228,0.65)",
              marginTop: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            All communications are confidential by default.
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            style={{
              background: "rgba(168, 130, 44, 0.08)",
              border: "1px solid rgba(168, 130, 44, 0.25)",
              color: "#A8822C",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#A8822C";
              e.currentTarget.style.color = "#F4EFE4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(168, 130, 44, 0.08)";
              e.currentTarget.style.color = "#A8822C";
            }}
          >
            ↑ Back to Top
          </button>
        </div>
      </div>

      {/* Bottom Rule */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "2.5rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(244,239,228,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.6rem",
            fontWeight: 300,
            letterSpacing: "0.1em",
            color: "rgba(244,239,228,0.6)",
          }}
        >
          © {new Date().getFullYear()} Veixon. All rights reserved.
          <span style={{ margin: "0 0.6em", opacity: 0.4 }}>·</span>
          All ideas received are subject to a signed confidentiality agreement.
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.6rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: "#A8822C",
          }}
        >
          DZ-LEDGER-{new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
