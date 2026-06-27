export function Footer() {
  return (
    <footer
      style={{
        background: "#0D1220",
        borderTop: "1px solid rgba(168,130,44,0.2)",
        padding: "3.5rem 2rem",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        {/* Wordmark */}
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#F4EFE4",
              letterSpacing: "0.01em",
              marginBottom: "0.3rem",
            }}
          >
            DayZero<span style={{ color: "#A8822C" }}>Foundry</span>
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 300,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(244,239,228,0.35)",
            }}
          >
            A Veixon Product · Est. {new Date().getFullYear()}
          </div>
        </div>

        {/* Centre — ruling */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: "rgba(244,239,228,0.3)",
            textAlign: "center",
          }}
        >
          Every idea is currency.
          <br />
          <span style={{ color: "rgba(168,130,44,0.6)" }}>
            We mint yours into a real product.
          </span>
        </div>

        {/* Right — contact */}
        <div style={{ textAlign: "right" }}>
          <a
            href="mailto:hello@dayzero.build"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 400,
              letterSpacing: "0.12em",
              color: "#A8822C",
              textDecoration: "none",
              borderBottom: "1px solid rgba(168,130,44,0.35)",
              paddingBottom: "1px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A24A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#A8822C")}
          >
            hello@dayzero.build
          </a>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.58rem",
              fontWeight: 300,
              letterSpacing: "0.12em",
              color: "rgba(244,239,228,0.25)",
              marginTop: "0.35rem",
            }}
          >
            All communications are confidential by default.
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "2rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(244,239,228,0.05)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.58rem",
            fontWeight: 300,
            letterSpacing: "0.1em",
            color: "rgba(244,239,228,0.2)",
          }}
        >
          © {new Date().getFullYear()} Veixon. All rights reserved.
          <span style={{ margin: "0 0.6em", opacity: 0.4 }}>·</span>
          All ideas received are subject to a signed confidentiality agreement.
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.58rem",
            fontWeight: 300,
            letterSpacing: "0.1em",
            color: "rgba(244,239,228,0.2)",
          }}
        >
          DZ-LEDGER-{new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
